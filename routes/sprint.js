var express = require('express');
var router = express.Router();
var Project = require('../db/models/project');

router.get('/create',(req, res)=>{
	res.render('sprintcreate');
});

router.get('/view/:spid/:pid',async (req, res)=>{
	var data = await Project.find({ '_id':req.params.pid });
	//var finalData = await Project;
	console.log(data[0]);
	res.render('sprintview',{
		data:data[0],
		sprintId: req.params.spid,
		pId: req.params.pid
	});
});

//start sprint
router.post('/start/:projId/:tp', async(req, res)=>{	//not
	const projId = req.params.projId;
	const tp = req.params.tp;
	await Project.updateOne({ "_id": projId,
		sprints:{ $elemMatch : { "spName": tp } }
	}, 
	{ $set:{ 'sprints.$.status': "start" } }
	);
	console.log('done');
	res.redirect(req.get('referer'));
});

//end sprint
router.post('/end/:projId/:tp', async(req, res)=>{	//not
	const projId = req.params.projId;
	const tp = req.params.tp;
	await Project.updateOne({ "_id": projId,
		issue:{ $elemMatch : { "sprint": tp } }
	}, 
	{ $set:{ 'issue.$.sprint': "none" } }
	);

	await Project.updateOne({ "_id": sprintId,
		sprints:{ $elemMatch : { "spName": tp } }
	}, 
	{ $set:{ 'sprints.$.status': "end" } }
	);
	console.log('done');
	res.redirect('/sprint/view/'+tp+'/'+projId);
});

router.post('/create/:id',async (req, res)=>{
	console.log(req.body);
	await Project.updateOne({ "_id" : req.params.id},
							{ "$push": {
								"sprints": req.body
							}});
	console.log('created');
	res.redirect('/');
});



module.exports = router;