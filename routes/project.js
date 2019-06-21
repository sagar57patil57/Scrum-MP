var express = require('express');
var router = express.Router();
const Project = require('../db/models/project');
const User = require('../db/models/user');

router.get('/create',async (req, res)=>{
	const users = await User.find({  });
	res.render('projectcreate',{
		users: users,
	});
});

router.post('/create',(req, res)=>{

	Project.create(req.body,(err,project)=>{
		if(err){
			return res.send(err)
		}
		else {
			console.log('created');
		}
	});

	res.redirect('/project/view');
});

router.get('/view',async (req, res)=>{
	const projectNames = await Project.find({});
	res.render('projectview',{
		projectNames: projectNames
	});
});

router.get('/fullprojectview/:id',async (req, res)=>{
	
	var stats = {};
	var bugcount=0,taskcount=0,storycount=0,featurecount=0,improvebugcount=0;

	const project = await Project.findById(req.params.id);
	//console.log(project);
	if(project){
				if(project.issue.length>0){
					for(var j=0;j<project.issue.length;j++){
							if(project.issue[j].issuetype.toString() === 'Bug'.toString()){
								bugcount++;
							}
							else if(project.issue[j].issuetype.toString() === 'Task'){
								taskcount++;
							}
							else if(project.issue[j].issuetype.toString() === 'Story'){
								storycount++;
							}
							else if(project.issue[j].issuetype.toString() === 'New Feature'){
								featurecount++;
							}
							else if(project.issue[j].issuetype.toString() === 'Improvement'){
								improvebugcount++;
							}
					}
		}
	}

	stats = {
		bugcount,
		taskcount,
		storycount,
		featurecount,
		improvebugcount
	}

	//console.log(stats);
	res.render('fullprojectview',{
		project,
		stats,
		projid: req.params.id
	});
});


module.exports = router;