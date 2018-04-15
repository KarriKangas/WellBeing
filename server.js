const express = require('express')
const app = express()

console.log("Running node version" + process.version);

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://USER:PASSWORD@ds133054.mlab.com:33054/wellbeing";

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var users = ["Karri","Yufei","Chuangye","Jesse","Emppu","Tingting"];

app.get('/', function (req, res){
        console.log("Someone attempted to connect to the server " + req + " and time " + Date());
        return res.send('Waiting for our front-end guys to send us an HTTP request! @ http://18.219.64.17/');
});

app.listen(80, function(){
        return console.log('App listening on port 80!');
});



app.post('/numbers', function(req, res){
        var number = req.body.nro;
        var id = req.body.id;
        res.send("You tried to contact with number: " + number + " contacting person was " + users[id]);
        return console.log("Someone tried to contact /numbers with " + number);
});

app.post('/login', function (req,res){
        console.log("Someone tried to /login");
        var username = req.body.username;
        var password = req.body.password;
        var tokenToChange = Math.random().toString();
        var resultToSend = "";
        var myquery = { name: username };
        console.log("with credentials " + username + "/" + password);
        //res.send("Attempting to login");
        MongoClient.connect(url, function(err, db) {
        var dbo = db.db("wellbeing");
        dbo.collection("users").find(myquery).toArray(function(err, result) {
                        if (err) throw err;

                        if(!result[0]){
                            resultToSend = (-1);
                        }
                            else if(password == result[0].password){
                                console.log("Login attempt successful!");
                                var newvalues = { $set: {token: tokenToChange } };
								
                        dbo.collection("users").updateOne(myquery, newvalues, function(err, res) {
                                if (err) throw err;
                                console.log("1 document updated");
                                resultToSend = tokenToChange;
                                });
                        }else{
                            console.log("Login attempt failed");
                            resultToSend = (0);
                        }

                        db.close();
                });
        });

        var tryLoginInterval = setInterval(function() { loginTimer() }, 1000);

        function loginTimer(){
                if(TryConfirmAction(resultToSend)){
                        res.send("Login attempt done: " + resultToSend);
                        clearInterval(tryLoginInterval);
                }
        }
});

function TryConfirmAction(result){
        if(result && result.length > 0 || result > -2){
                return true;
        }

        return false;
}

