
let express = require( "express" );
let morgan = require( "morgan" );
let mongoose = require( "mongoose" );
let bodyParser = require( "body-parser" );
let { StudentList } = require('./model');
let { Users } = require('./model');
let bcrypt = require('bcryptjs');
const { DATABASE_URL, PORT } = require('./config');


let app = express();
let jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

app.use( express.static( "public" ) );

app.use( morgan( "dev" ) );

let studentaux= [];

app.get( "/api/students", ( req, res, next ) => {
	StudentList.get()
		.then( students => {
			var i;
			for(i in students)
			{
				studentaux.push(students[i]);
			}
			return res.status( 200 ).json( students );
		})
		.catch( error => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
		});
});

app.post( "/api/postStudent", jsonParser, ( req, res, next ) => {
	let firstName = req.body.firstName;
	let lastName = req.body.lastName;
	let id = req.body.id;

	let newStudent = {
		firstName,
		lastName,
		id
	}
	var i;
			for(i in studentaux)
			{
				if(newStudent.id == studentaux[i])
					return res.status( 400 ).json({
							status : 400,
							message : "Student id already exists"
						})
				
			}
	StudentList.post(newStudent)
		.then( student => {
			
			return res.status( 201 ).json({
				message : "Student added to the list",
				status : 201,
				student : student
			});
		})
		.catch( error => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
		});
	/*
	if ( ! name || ! id ){
		res.statusMessage = "Missing field in body!";
		return res.status( 406 ).json({
			message : "Missing field in body!",
			status : 406
		});
	}

	for( let i = 0; i < students.length; i ++ ){
		if ( id == students[i].id ){
			res.statusMessage = "Repeated identifier, cannot add to the list.";

			return res.status( 409 ).json({
				message : "Repeated identifier, cannot add to the list.",
				status : 409
			});
		}
	}

	let newStudent = {
		id : id,
		name : name
	};

	students.push( newStudent );

	return res.status( 201 ).json({
		message : "Student added to the list",
		status : 201,
		student : newStudent
	});
	*/

});

app.get( "/api/getStudentById", ( req, res, next ) =>{
	let id = req.query.id;

	StudentList.getId({id:id})
		.then( student => {
			return res.status( 200 ).json( student );
		})
		.catch( error => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
		});
	
	
	// if ( !id ){
		// res.statusMessage = "Missing 'id' field in params!";
		// return res.status( 406 ).json({
			// message : "Missing 'id' field in params!",
			// status : 406
		// });
	// }

	// for( let i = 0; i < students.length; i ++ ){
		// if ( id == students[i].id ){
			// return res.status( 202 ).json({
				// message : "Student found in the list",
				// status : 202,
				// student : students[i]
			// });
		// }
	// }

	// res.statusMessage = "Student not found in the list.";

	// return res.status( 404 ).json({
		// message : "Student not found in the list.",
		// status : 404
	// });

});


app.put( "/api/updateStudent/:id",jsonParser, ( req, res, next ) =>{
	let id = req.params.id;
	let bodyid = req.body.id;
	let firstNameBody = req.body.firstName;
	let lastNameBody = req.body.lastName;
	var element = {firstName: firstNameBody, lastName: lastNameBody, id: bodyid};
	
	StudentList.put(id, element )
		.then( student => {
			return res.status( 200 ).json( student );
		})
		.catch( error => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
		});
});


app.delete( "/api/deleteStudent",( req, res, next ) =>{
		let id = req.query.id;
	
	StudentList.DELETE(id)
		.then( student => {
			return res.status( 200 ).json( student );
		})
		.catch( error => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
		});
});

let server;

app.post( "/api/postUser", jsonParser, ( req, res, next ) => {
	let username = req.body.username;
	let password = req.body.password;
	
	let hashpass = bcrypt.hash(password,10); //encrypt
	Users.create({
		username,
		password: hashpass
	})
	.then(user => {
					return res.status(200).json(user);
				})
				.catch( error => {
					throw Error(error);
				});
	
	
});

app.post( "/api/postStudent", jsonParser, ( req, res, next ) => {
	let username = req.body.username;
	let password = req.body.password;
	
	let hashpass = bcrypt.hash(password,10); //encrypt
	Users.get({
		username
	})
	.then(user => {
					if(bcrypt.compare(password, user.password)){
					res.statusMessage = "logged in correctly!!!!";
					return res.status(200).json({ message: "logged in"});
					
					}
				})
				.catch( error => {
					throw Error(error);
				});
	
	
});


function runServer(port, databaseUrl){
	return new Promise( (resolve, reject ) => {
		mongoose.connect(databaseUrl, response => {
			if ( response ){
				return reject(response);
			}
			else{
				server = app.listen(port, () => {
					console.log( "App is running on port " + port );
					resolve();
				})
				.on( 'error', err => {
					mongoose.disconnect();
					return reject(err);
				})
			}
		});
	});
}

function closeServer(){
	return mongoose.disconnect()
		.then(() => {
			return new Promise((resolve, reject) => {
				console.log('Closing the server');
				server.close( err => {
					if (err){
						return reject(err);
					}
					else{
						resolve();
					}
				});
			});
		});
}

runServer(PORT, DATABASE_URL)
	.catch( err => {
		console.log( err );
	});

module.exports = { app, runServer, closeServer };















