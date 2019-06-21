var express = require('express');
var path = require('path');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../db/models/user');
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');

router.get('/register', (req, res)=>{
	//console.log(req.session.registerErrors);
	res.render('register',{
		errors: []
	});
});

router.post('/register', (req, res)=>{
	
	var newuser=req.body;
	User.findOne({ $or:[ {'email':req.body.email}, {'username':req.body.username} ]},(err, userss)=>{
		if(err){
			console.log('err', err);
		}
		if(userss){
			console.log(userss);
			return res.redirect('/user/register');
		}
		else{
			newuser = {
				...req.body,
				"_id": mongoose.Schema.Types.ObjectId(uuidv1())
			}
			User.create(newuser,(error)=>{
			if(error){
				/*const registerErrors = Object.keys(error.errors).map(key => error.errors[key].message);
				req.flash('registerErrors',registerErrors);*/
				console.log(error);
				return res.render('register',{
					errors: []//req.flash('registerErrors')
				});
			}
			else{
				res.redirect('/user/login');
			}
		});
		}
	})
	/*if(euser.collectionName === 'users')
	{
		console.log(euser);
	}
	else
	{*/

	//}//ifend
});

router.get('/login', (req, res)=>{

	res.render('login');
});

router.post('/login', (req, res)=>{

	const form_email = req.body.email;
	User.findOne({email: form_email},(err,user)=>{
		if(!user)
		{
			console.log(err);
			res.redirect('/');
		}
		else
		{
			bcrypt.compare(req.body.pwd,user.pwd,(err,same)=>{
				console.log(same);
				if(same)
				{
					req.session.userId = user._id;
					//console.log(req.session);
					console.log('Success');
					res.redirect('/');
				}
				else
				{
					console.log(err + 'if this');
					return res.redirect('/');
				}
			});
		}
	})

});

router.get('/logout', (req, res)=>{

	if(req.session.userId){
		req.session.destroy(()=>{
		res.redirect('/');
	});
	}
	else {
		res.redirect('/about');
	}
});


router.get('/list',async (req,res)=>{

	const user= await User.find();
	console.log(user);
	if(!user){
		return res.redirect('/');
	}
	else{
		res.render('usersall',{
			user
		});
	}

});


router.get('/profile/:id',async (req,res)=>{

	const user= await User.find({_id:req.params.id});
	console.log(user);
	if(!user){
		return res.redirect('/');
	}
	else{
		res.render('userprofile',{
			user
		});
	}

});


router.post('/upload',(req, res)=>{
	const { image } = req.files;	//just like req.body but for files
	image.mv(path.resolve(__dirname,'..' ,'public/userimages', image.name), (err)=>{

		console.log(err);

		User.updateOne({_id: req.session.userId}, {
			profilepic: '/userimages/' + image.name,
		},(err,post)=>{
			console.log('Ye',post);
		res.redirect('/user/profile/'+req.session.userId);
	});

	});	//move this file to other location
});



module.exports = router;