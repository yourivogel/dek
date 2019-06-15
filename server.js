const connectionData = require('./connection.js');
let app = require('express')();
let http = require('http').createServer(app);
let socket = require('socket.io')(http);
let fs = require('fs');
let vragenlijst = fs.readFileSync("vragen.json");
let jsonVragen = JSON.parse(vragenlijst);
let mysql = require('mysql');
let connection = mysql.createConnection(connectionData);

let queries = {
	exercises: 'SELECT * FROM `opdrachten`',
	exercise: 'SELECT * FROM `vragen` WHERE `opdracht_id` = :opdracht_id',
};


app.get( '/' , function(req, res){
    res.sendFile( __dirname + '/index.html' );
});

connection.connect( function ( err ) {
    if ( err ) {
      return console.error( 'error: ' + err.message );
    }
    console.log( 'Connected to the MySQL server.' );
});

 socket.on( 'connection', function( socket ){
    console.log( 'a client has connected' );

    socket.on( 'disconnect', function () {
        console.log( 'a client has disconnected' );
	})
	
	socket.on( 'exercises', ( data, fn ) => {
		console.log(1);
		connection.query( queries.exercises, function ( err, result, fields ) {
		  	if ( err ) throw err;
		  	fn( result );
		});
	});

	socket.on( 'exercise', ( data, fn ) => {
		connection.query( queries.exercise, { 'opdracht_id': data.id },  function ( err, result, fields ) {
			if ( err ) throw err;
			fn( result );
		});
	});
});

http.listen( 3000, function() {
    console.log( 'listening on *:3000' );
});

