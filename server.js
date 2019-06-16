const process = require('process');
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
	exercise: 'SELECT * FROM `questions` WHERE `exercise_id` = ? ORDER BY RAND()',
	question: 'SELECT `id`, `answer` FROM `answers` WHERE `question_id` = ? ORDER BY RAND()',
	answer: 'SELECT `id`, `answer`, `correct` FROM `answers` WHERE `question_id` = ?',
};

var clients = [];

process.on( 'uncaughtException', function ( err ) {
	console.log( 'Caught exception: ', err );
} );

app.get( '/' , function( req, res ){
    res.sendFile( __dirname + '/index.html' );
} );

connection.connect( function ( err ) {
    if ( err ) {
      return console.error( 'error: ' + err.message );
	}
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
	progress: function ( socket ) {
		let c = clients[socket.id];

		socket.emit( 'progress', c.exercise.progress );
	},
	finished: function () {
		socket.emit( 'finished' );
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

			responses.progress( socket );

			fn();
		} ) ;
	} );

	// request question
	socket.on( 'question', ( data, fn ) => {
		let c = clients[socket.id];

		if ( c.exercise.progress.current < c.exercise.progress.total ) {
			responses.question( socket );
		}
	} );

	// request process answer
	socket.on( 'answer', ( data, fn ) => {
		let c = clients[socket.id];

		if ( c.exercise.progress.current < c.exercise.progress.total ) {
			connection.query( queries.answer, [ c.exercise.questions[c.exercise.progress.current].id ], function ( err, result, fields ) {
				if ( err ) throw err;

				// open question
				if ( result.length === 1 ) {
					c.exercise.progress.current += 1;

					if ( result[0].answer.toLowerCase() === data.answer.toLowerCase() ) {
						// correct
					} else {
						c.exercise.progress.incorrect += 1;
					}

					fn( result );
				} 
				
				// mutliple choice question
				if ( result.length > 1 ) {
					let correct = false;

					c.exercise.progress.current += 1;

					for (let answer of result ) {
						if ( answer.id == data.answer ) {
							if ( answer.correct ) correct = true;
						}
					}

					if ( correct ) {
						// correct
					} else {
						c.exercise.progress.incorrect += 1;
					}

					fn( result );
				}

				if ( c.exercise.progress.current == c.exercise.progress.total ) {
					responses.finished( socket);
				}

				responses.progress( socket );
			} );
		}
	} );
} );

http.listen( 3000, function( ) {
    console.log( 'listening on *:3000' );
} );

