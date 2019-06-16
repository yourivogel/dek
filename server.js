const connectionData = require('./connection.js');
var app = require('express')();
var http = require('http').createServer(app);
var socket = require('socket.io')(http);
var fs = require('fs');
var vragenlijst = fs.readFileSync("vragen.json");
var jsonVragen = JSON.parse(vragenlijst);
var mysql = require('mysql');
let connection = mysql.createConnection(connectionData);
var sqlselect= "SELECT vraag FROM vragen WHERE id = 1";
var sqlantwoordselect = "SELECT antwoord FROM vragen WHERE id = 1"


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

connection.connect(function (err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
    
    if (err) throw err;
    
    connection.query(sqlselect, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      
    });

    connection.query(sqlantwoordselect, function(err, result, fields){
      if (err) throw err;
      console.log(result);
    })
  });

 socket.on('connection', function(socket){
    console.log('a user connected');
    socket.on('loginValue', function(user) {
       console.log('user', user);
       socket.userName = user;
    });
    socket.on('disconnect', function () {
        console.log('log-out: ' + socket.userName)
    })
    socket.on('check', function(answer){
        console.log(answer);
     
     })
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

