const express = require('express')
const app = express()
var QA = require('./QA.js')

console.log("Running node version" + process.version);

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://USER:PASSWORD@ds133054.mlab.com:33054/wellbeing";

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

var users = ["Karri", "Yufei", "Chuangye", "Jesse", "Emppu", "Tingting"];

app.get('/', function(req, res) {
    console.log("Someone attempted to connect to the server " + req + " and time " + Date());
    return res.send('Waiting for our front-end guys to send us an HTTP request! @ http://18.219.64.17/');
});

app.listen(80, function() {
    return console.log('App listening on port 80!');
});



app.post('/numbers', function(req, res) {
    var number = req.body.nro;
    var id = req.body.id;
    res.send("You tried to contact with number: " + number + " contacting person was " + users[id]);
    return console.log("Someone tried to contact /numbers with " + number);
});

app.post('/login', function(req, res) {
    console.log("Someone tried to /login");
    var username = req.body.username;
    var password = req.body.password;
    var tokenToChange = Math.random().toString();
    var resultToSend = "";
    var myquery = {
        name: username
    };
    console.log("with credentials " + username + "/" + password);
    //res.send("Attempting to login");
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("wellbeing");
        dbo.collection("users").find(myquery).toArray(function(err, result) {
            if (err) throw err;

            if (!result[0]) {
                resultToSend = ("-1");
            } else if (password == result[0].password) {
                console.log("Login attempt successful!");
                var newvalues = {
                    $set: {
                        token: tokenToChange
                    }
                };
                dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                    resultToSend = tokenToChange;

                });
            } else {
                console.log("Login attempt failed");
                resultToSend = ("0");
            }

            db.close();
        });
    });

    var tryLoginInterval = setInterval(function() {
        loginTimer()
    }, 1000);

    function loginTimer() {
        if (TryConfirmAction(resultToSend)) {
            res.send("" + resultToSend);
            clearInterval(tryLoginInterval);
        }
    }
});

function TryConfirmAction(result) {
    if (result && result.length > 0 || result > -2 || result.id > -1) {
        return true;
    }

    return false;
}


app.post('/question', function(req, res) {
    var tokenToFind = req.body.token;
    var myquery = {
        token: tokenToFind
    }
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("wellbeing");
        dbo.collection("users").find(myquery).toArray(function(err, result) {
            if (err) throw err;

            if (!result[0]) {
                searchResult = -1;
            } else if (tokenToFind == result[0].token) {
                console.log("User found!");
                searchResult = result[0].id;
                var questionToFind = Math.floor(Math.random() * Math.floor(48));
                var questionQuery = {
                    id: questionToFind
                };

                dbo.collection("questions").find(questionQuery).toArray(function(err, result) {
                    if (err) throw err;

                    if (!result[0]) {
                        res.send("No question found");
                    } else {
                        res.send(result[0].question);
                        saveQID(tokenToFind, result[0].id);
                    }

                });

                //res.send("Error no token found");
            }
            db.close();
        });
    });


    console.log("We have success!");
});

function saveQID(tokenToFind, QID) {

    var myquery = {
        token: tokenToFind
    }

    var newvalues = {
        $set: {
            currentQID: QID
        }
    };


    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("wellbeing");
        dbo.collection("users").find(myquery).toArray(function(err, result) {
            if (err) throw err;

            console.log("Found " + result[0] + " updating to " + QID);
            dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");


            });

            db.close();
        });
    });

}

app.post('/answer', function(req, res) {
    var tokenToFind = req.body.token;
    var useranswer = req.body.answer;
    var myquery = {
        token: tokenToFind
    }
    var question;
    MongoClient.connect(url, function(err, db) {
        var dbo = db.db("wellbeing");
        dbo.collection("users").find(myquery).toArray(function(err, result) {
            if (err) throw err;

            if (!result[0]) {
                searchResult = -1;
            } else if (tokenToFind == result[0].token) {
                console.log("User found with QID " + result[0].currentQID);


                var questionQuery = {
                    id: result[0].currentQID

                };
                dbo.collection("questions").find(questionQuery).toArray(function(err, qres) {
                    if (err) throw err;

                    if (!qres[0]) {
                        console.log("No question found");
                    } else {
                        question = qres[0];
                        console.log("Question found");
                    }

                });

                var tryQuestionInterval = setInterval(function() {
                    questionTimer()
                }, 1000);

                function questionTimer() {
                    if (TryConfirmAction(question)) {
                        console.log("Yes question! " + question.category + " " + question.weight + " " + result[0].wbi + " " + result[0].C0Index);
                        var answerValues = {
                            category: question.category, // (which category)
                            answer: useranswer, // (what was the answer)
                            weight: question.weight, // (weight of questions answered)
                            previousAnswers: result[0].list_pre_question, //(Amount of previous answers)
                            category0WBI: result[0].C0Index, // (The index of category 0)
                            category1WBI: result[0].C1Index, // (The index of category 1)
                            category2WBI: result[0].C2Index, // (The index of category 2)
                            category3WBI: result[0].C3Index, // (The index of category 3)
                            category4WBI: result[0].C4Index, // (The index of category 4)
                            category5WBI: result[0].C5Index, // (The index of category 5)
                            totalWBI: result[0].wbi
                        }

                        var calculatedAnswer = QA.question.new_answer(answerValues);

                        var newvalues = {
                            $set: {
                                wbi: calculatedAnswer.totalWBI,
                                C0Index: calculatedAnswer.category0WBI,
                                C1Index: calculatedAnswer.category1WBI,
                                C2Index: calculatedAnswer.category2WBI,
                                C3Index: calculatedAnswer.category3WBI,
                                C4Index: calculatedAnswer.category4WBI,
                                C5Index: calculatedAnswer.category5WBI,
                            }
                        }

                        dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
                            if (err) throw err;
                            console.log("1 document updated");

                        });
                        clearInterval(tryQuestionInterval);
                    } else {
                        console.log("No question!");
                    }
                    db.close();
                }



                //res.send("Error no token found");
            }

        });
    });
});

