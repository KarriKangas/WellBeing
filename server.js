const express = require('express')
const app = express()

console.log("Running node version" + process.version);

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://username:password@ds133054.mlab.com:33054/wellbeing";

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


MongoClient.connect(url, function(err, db) {
console.log("Connecting to database");
if (err) throw err;
console.log("Succsefully connected to database! Performing a query to db/wellbeing/users");
  var dbo = db.db("wellbeing");
  dbo.collection("users").findOne({}, function(err, result) {
        if (err) throw err;
        console.log("Query successful!");
        console.log(result);
db.close();
  });
});