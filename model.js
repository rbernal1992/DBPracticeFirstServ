let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let studentSchema = mongoose.Schema({
	firstName : { type : String },
	lastName : { type : String },
	id : { 
			type : Number,
			required : true }
});

let Student = mongoose.model( 'Student', studentSchema );


let StudentList = {
	get : function(){
		return Student.find()
				.then( students => {
					return students;
				})
				.catch( error => {
					throw Error(error);
				});
	},
	post : function( newStudent ){
		return Student.create(newStudent)
				.then(student => {
					return student;
				})
				.catch( error => {
					throw Error(error);
				});
	},
	getId : function(id){
		return Student.findOne(id)
				.then( student => {
					return student;
				})
				.catch( error => {
					throw Error(error);
				});
	},
	put : function(id,uStudent){
		return Student.findOneAndUpdate({id:id}, uStudent, {new:true})
				.then( student => {
					return student;
				})
				.catch( error => {
					throw Error(error);
				});
	},
	DELETE: function(id){
		return Student.findOneAndRemove({id:id})
				.then( student => {
					return student;
				})
				.catch( error => {
					throw Error(error);
				});
		
	},
}

module.exports = { StudentList };


