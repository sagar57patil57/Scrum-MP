var express = require('express');
var router = express.Router();
const Project = require('../db/models/project');
const User = require('../db/models/user');
var nodemailer = require('nodemailer');

router.get('/create',async (req, res)=>{
	const users = await User.find({  });
	const project = await Project.find({  });
	res.render('issuecreate',{
		users: users,
		project: project
	});
});

router.get('/view',async (req, res)=>{
	const projectNames = await Project.find({  });
	//console.log(projectNames);
	res.render('issueview',{
		projectNames: projectNames
	});
});


router.get('/view/all',async (req, res)=>{
	const projectNames = await Project.find({  });
	//console.log(projectNames);
	
	const projectNames1 = [];

	if(projectNames){
		for(var i = 0;i < projectNames.length ; i++){
			for(var j = 0;j < projectNames[i].issue.length ; j++){
					projectNames1.push(projectNames[i].issue[j]);
			}
		}
	}


	res.render('allissues',{
		issues: projectNames1
	});
});

router.post('/view/all',async (req, res)=>{	//for searching
	
	const query = req.body.search;
	const searchobj = {
		x: query
	}

	const projectNames1 = [];

	const projectNames= await Project.find({'issue.desc': {'$regex': query,$options:'i'}});
	if(projectNames){
		for(var i = 0;i < projectNames.length ; i++){
			for(var j = 0;j < projectNames[i].issue.length ; j++){
				if(projectNames[i].issue[j].desc.toLowerCase().toString().includes(query.toLowerCase().toString())){
					//console.log(projectNames[i].issue[j].desc.toLowerCase().toString(), query.toLowerCase().toString());
					projectNames1.push(projectNames[i].issue[j]);
				}
			}
		}
	}
	projectNames.x = query;
	//console.log(projectNames1);

	res.render('allissues',{
		'issues': projectNames1
	});
});



router.post('/create',async (req, res)=>{

	const project = await Project.findOne({name:req.body.projectname});
	const user = await User.findOne({_id: req.session.userId});
	const allusers = await User.find({});
	const data = {
		...req.body,
		createdBy: user.username
	}


	//nodemailer
	var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'sagar57patil57@gmail.com',
            pass: 'PASSWORD'
        }
    });

	var emailarr= [];

  for(var i=0; i <allusers.length;i++){
 	emailarr.push(allusers[i].email);
  }

  const mailHtml = '<h3>New Issue Added by </h3>' + user.username + '</br><p>Following are the details : </p></br>'
  					+ '<ul class="list-group"> <li class="list-group-item">Belongs to : <b> ' + req.body.projectname + '</b></li><li class="list-group-item">Assigned to : <b>' + req.body.assgnto + '</b></li> <li class="list-group-item">Lead by : <b>' + req.body.leader + '</b></li>'	+	'<li class="list-group-item">Issue type : <b>' + req.body.issuetype + '</b></li><li class="list-group-item"> Desc : ' + req.body.desc + '</li>' 
  					+ 'Link : <a href="http://localhost:3000/issue/view">Visit</a>'
  var mailOptions = {
      from: 'sagar57patil57@gmail.com',
      to: emailarr,
      subject: 'New Issue added',
      text: '',
      html: mailHtml
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
          res.redirect('/');
      } else {
          console.log('message Sent: ' + info.response);
          res.redirect('/');
      }
  });
	//nodemailer end




	Project.findOneAndUpdate({ _id : project._id },{ $push : { issue: data } },(err,project)=>{
		if(err){
			return res.send(err)
		}
		else {
			console.log('created');
		}
	});
	res.redirect('/issue/view');
});

router.get('/fullissueview/:id',async (req, res)=>{	//find an issue in db
	//const project = await Project.findOne({ issue: { $elemMatch: { _id: req.params.id } } });
	const project = await Project.findOne({ "issue._id" : req.params.id });
	const user = await User.find({});
	const theKey = {
		issue_id: req.params.id
	}
	//console.log('hey',project);
	res.render('fullissueview',{
		project: project,
		theKey: theKey,
		user: user
	});
});


router.post('/comment/:pid/:id',async (req, res)=>{	//add comment

	const user = await User.findOne({_id: req.session.userId});

	const data = {
		username: user.username,
		comment: req.body.comment
	}
	//console.log(req.params.pid,' HRRERE ',req.params.id);
	//console.log(data);

	Project.updateOne({ "_id" : req.params.pid, "issue._id": req.params.id }
							,{ "$push" : { "issue.$.comments": data } },(err,project)=>{
		if(err){
			return res.send(err)
		}
		else {
			console.log('created');
			res.redirect('/issue/fullissueview/' + req.params.id);
		}
	});
});


router.post('/assign/:issueid',async (req, res)=>{	//assign issue to user

		//nodemailer
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	        user: 'sagar57patil57@gmail.com',
	        pass: 'PASSWORD'
	    }
	});

  const mailHtml = 'You have been assigned to an issue'
  					+ 'Link : <a href="http://localhost:3000/issue/fullissueview/' + req.params.issueid + '">Visit</a>';
  var mailOptions = {
      from: 'sagar57patil57@gmail.com',
      to: req.body.email,	//to selected user
      subject: 'New Issue added',
      text: 'Solve it',
      html: mailHtml
  };

  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      } else {
          console.log('message Sent: ' + info.response);
      }
  });
	//nodemailer end

	Project.updateOne({ "issue._id": req.params.issueid },{ $set: {	//if assigning and status is unassigned then after assigning change status to todo
		"issue.$.status": 'todo'
	} },(err,project)=>{
		if(err){
			return res.send(err)
		}
		else {
			console.log('status updated as well');
		}
	});

	Project.updateOne({ "issue._id": req.params.issueid },{ $set: {
		"issue.$.assgnto": req.body.email
	} },(err,project)=>{
		if(err){
			return res.send(err)
		}
		else {
			res.redirect('/issue/view');
		}
	});

});


router.post('/changestatus/:issueid',async (req, res)=>{	//change status

	Project.updateOne({ "issue._id": req.params.issueid },{ $set: {
		"issue.$.status": req.body.status
	} },(err,project)=>{
		if(err){
			return res.send(err)
		}
		else {
			res.redirect('/issue/view');
		}
	});
});

router.post('/setsprint/:issueid',async (req, res)=>{	//set issue's sprint

	Project.updateOne({ "issue._id": req.params.issueid },{ $set: {
		"issue.$.sprint": req.body.sprintName
	} },(err,project)=>{
		if(err){
			return res.send(err)
		}
		else {
			console.log(project);
			res.redirect('/issue/view');
		}
	});
});



module.exports = router;
