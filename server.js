const connectionData = require( './connection.js' );
let app = require( 'express' )( );
let http = require( 'http' ).createServer( app );
let socket = require( 'socket.io' )( http );
let fs = require( 'fs' );
let vragenlijst = fs.readFileSync( "vragen.json" );
let jsonVragen = JSON.parse( vragenlijst );
let mysql = require( 'mysql' );
let connection = mysql.createConnection( connectionData );

let queries = {
	levels: 'SELECT * FROM `levels`',
	exercises: 'SELECT * FROM `exercises`',
	exercise: 'SELECT * FROM `questions` WHERE `exercise_id` = ? ORDER BY RAND( )',
	question: 'SELECT `id`, `answer` FROM `answers` WHERE `question_id` = ?',
};

var clients = [];

app.get( '/' , function( req, res ){
    res.sendFile( __dirname + '/index.html' );
} );

connection.connect( function ( err ) {
    if ( err ) {
      return console.error( 'error: ' + err.message );
	}
	
    console.log( 'Connected to the MySQL server.' );
} );

let responses = {
	question: function ( socket ) {
		let c = clients[socket.id];

		connection.query( queries.question, 
			[ c.exercise.questions[c.exercise.progress.current].id ]
			,  function ( err, result, fields ) {
			if ( err ) throw err;

			if ( result.length > 1 ) {
				socket.emit( 'question', { question: c.exercise.questions[c.exercise.progress.current].question, answers: result} );
			} else {
				socket.emit( 'question', { question: c.exercise.questions[c.exercise.progress.current].question } );
			}
		} );
	},
};

socket.on( 'connection', function( socket ) {
	clients[socket.id] = { socket };
	console.log( 'a client has connected with id: ' + socket.id );
	

    socket.on( 'disconnect', function ( ) {
		console.log( 'a client has disconnected with id: ' + socket.id );

		delete clients[socket.id];
	} )
	
	// request all exercises
	socket.on( 'exercises', ( data, fn ) => {
		connection.query( queries.levels, function ( err, result, fields ) {
			  if ( err ) throw err;
			  
			let data = { levels: result };

			connection.query( queries.exercises, function ( err, result, fields ) {
				if ( err ) throw err;

				data.exercises = result;

				fn( data );

				console.log( socket.id + ' has requested all exercises' );
			} );
		} );
	} );

	// request initiate questions from exercise
	socket.on( 'exercise', ( data, fn ) => {
		connection.query( queries.exercise, [ data.id ],  function ( err, result, fields ) {
			if ( err ) throw err;

			let c = clients[socket.id];

			c.exercise = {
				id: data.id,
				questions: result,
				progress: {
					current: 0,
					total: result.length,
					incorrect: 0,
				},
			};

			console.log(c.exercise);

			responses.question( socket );
		} ) ;
	} );
} );

http.listen( 3000, function( ) {
    console.log( 'listening on *:3000' );
} );

