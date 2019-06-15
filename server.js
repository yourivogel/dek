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
	levels: 'SELECT * FROM `levels`',
	exercises: 'SELECT * FROM `exercises`',
	exercise: 'SELECT * FROM `questions` WHERE `exercise_id` = ? ORDER BY RAND()',
};

let clients = [];

app.get( '/' , function(req, res){
    res.sendFile( __dirname + '/index.html' );
});

connection.connect( function ( err ) {
    if ( err ) {
      return console.error( 'error: ' + err.message );
    }
    console.log( 'Connected to the MySQL server.' );
});

 socket.on( 'connection', function( socket ) {
	clients[socket.id] = { socket };
    console.log( 'a client has connected with id: ' + socket.id );

    socket.on( 'disconnect', function () {
		console.log( 'a client has disconnected with id: ' + socket.id );
		delete clients[socket.id];
	})
	
	// request all exercises
	socket.on( 'exercises', ( data, fn ) => {
		connection.query( queries.levels, function ( err, result, fields ) {
		  	if ( err ) throw err;
			let data = { levels: result };

			connection.query( queries.exercises, function ( err, result, fields ) {
				if ( err ) throw err;
				data.exercises = result;
				fn( data );
				console.log( socket.id + ' has requested all exercises');
			});
		});
	});

	// request initiate questions from exercise
	socket.on( 'exercise', ( data, fn ) => {
		connection.query( queries.exercise, [ data.id ],  function ( err, result, fields ) {
			if ( err ) throw err;
		});
	});
});

http.listen( 3000, function() {
    console.log( 'listening on *:3000' );
});

