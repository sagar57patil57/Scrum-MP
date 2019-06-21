var express = require('express');
const User = require('../db/models/user');
const Project = require('../db/models/project');
var router = express.Router();
const path = require('path');

// if assgnto cnges status chnges
router.get('/',(req, res)=>{
	res.render('index');
});

router.get('/dashboard/emp',async (req, res)=>{
	const user = await User.findOne({ _id: req.session.userId });
	const projectsCreated = await Project.findOne({ 'issue.createdBy' : user.email });
	
	const projectNames = await Project.find({  });
	//console.log(projectNames);
	
	const projectNames1 = [];const projectNames2 = [];

	if(projectNames){
		for(var i = 0;i < projectNames.length ; i++){
			for(var j = 0;j < projectNames[i].issue.length ; j++){
				if(projectNames[i].issue[j].createdBy.toString() === user.username.toString()){
					projectNames1.push(projectNames[i].issue[j]);
				}
			}
		}
	}

	if(projectNames){
		for(var i = 0;i < projectNames.length ; i++){
			for(var j = 0;j < projectNames[i].issue.length ; j++){
				if(projectNames[i].issue[j].assgnto.toString() === user.email.toString()){
					projectNames2.push(projectNames[i].issue[j]);
				}
			}
		}
	}

	//console.log(projectNames1, projectNames2);
	res.render('dashboardemp',{
		projectNames1,
		projectNames2
	});
});

router.get('/dashboard/man',async (req, res)=>{
	const projectNames = await Project.find({  });
	const projectNames1 = [];

	if(projectNames){
		for(var i = 0;i < projectNames.length ; i++){
			for(var j = 0;j < projectNames[i].issue.length ; j++){
				if(projectNames[i].issue[j].status.toString() === 'unassigned'){
					projectNames1.push(projectNames[i].issue[j]);
				}
			}
		}
	}

	//console.log(projectNames1);
	res.render('dashboardman',{
		projectNames1
	});
});



router.get('/chat',(req, res)=>{
	res.sendFile(path.join(__dirname, '../public', 'indexer.html'));
});



module.exports = router;