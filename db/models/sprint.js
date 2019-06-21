const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const sprintSchema = new mongoose.Schema({
	name:{
		type: String,
		unique: true
	},
	startDate:{
		type: String
	},
	endDate:{
		type: String
	},
	goal:{
		type: String
	}
});

sprintSchema.pre('save', function(next){
	console.log('Saving...');
	next();
});

const Sprint = mongoose.model('Sprint',sprintSchema);	//represents a collections and its obj repesents a document

module.exports = Sprint;