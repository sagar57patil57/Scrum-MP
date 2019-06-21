const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
	username:{
		type: String,
		required: [true, 'Please Enter the UserName'],
		unique: true
	},
	email:{
		type: String,
		required: [true, 'Please Enter the Email'],
		unique: true
	},
	profilepic:{
		type: String,
		default: '/img/user.png'
	},
	organization:{
		type: String,
		required: true
	},
	pwd:{
		type: String,
		required: [true, 'Please Enter the Password'],
	}
});

userSchema.pre('save', function(next){
	const user = this;

	bcrypt.hash(user.pwd, 10, function(err, ans){
		user.pwd = ans;
		next();
	})
});

const User = mongoose.model('User',userSchema);	//represents a collections and its obj repesents a document

module.exports = User;