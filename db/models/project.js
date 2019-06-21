const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const projectSchema = new mongoose.Schema({
	name:{
		type: String,
		unique: true
	},
	leader:{
		type: String
	},
	issue:[{
		desc:{
			type: String
		},
		issuetype:{
			type: String
		},
		projectname:{
			type: String
		},
		priority:{
			type: String
		},
		summary:{
			type: String
		},
		sprint:{
			type: String,
			default: 'none'	//ok
		},
		status:{
			type: String
		},
		createdBy:{
			type: String
		},
		assgnto:{
			type: String
		},
		comments:[{
			username:{
				type: String
			},
			comment:{
				type: String
			}
		}]
	}],
	sprints: [{
		spName: {
			type: String
		},
		spDur: {
			type: String
		},
		spStartDate: {
			type: Date
		},
		spEndDate: {
			type: Date
		},
		spGoal: {
			type: String
		},
		status: {
			type:String,
			default: 'none'	//ok
		}
	}]
});

projectSchema.pre('save', function(next){
	console.log('Saving...');
	next();
});

const Project = mongoose.model('Project',projectSchema);	//represents a collections and its obj repesents a document

module.exports = Project;