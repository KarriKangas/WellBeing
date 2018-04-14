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
        var resultToSend = "";
        console.log("with credentials " + username + "/" + password);
        var query = { name : username };
        //res.send("Attempting to login");
        MongoClient.connect(url, function(err, db) {
        var dbo = db.db("wellbeing");
        dbo.collection("users").find({}, {_id:0, values:1}).toArray(function(err, result) {
                        if (err) throw err;
                        console.log(result[0].values.length);
                        var values = result[0].values;
                        var length = result[0].values.length;
                        for(i = 0; i < length;i++){
                                if(username == values[i].name){
                                        console.log("Username found... Checking password...");

                                        if(password == values[i].password){
                                                console.log("Login attempt successful!");

                                                resultToSend= ("Login successfull!");
                                        }else{
                                                console.log("Login attempt failed");

                                                resultToSend = ("Password mismatch for user " + username);
                                        }
                                }else{
                                        resultToSend = ("Username " + username + " not found");
                                }
                        }

                        db.close();
                });
        });

        var tryLoginInterval = setInterval(function() { loginTimer() }, 1000);

        function loginTimer(){
                if(TryConfirmLogin(resultToSend)){
                        res.send("Login attempt done: " + resultToSend);
                        clearInterval(tryLoginInterval);
                }
        }
});

function TryConfirmLogin(result){
        if(result && result.length > 0){
                return true;
        }

        return false;
}
