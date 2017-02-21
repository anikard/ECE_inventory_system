var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');
var util = require('./util.js');

module.exports = (app) => {
	//app.use('/api/tag/show', util.requireLogin);
	app.use('/api/tag/add', util.requirePrivileged);
  	app.use('/api/tag/del', util.requirePrivileged);

	app.get('/api/tag/show', function(req, res, next) {
		show(req, res, next);
	});

	app.post('/api/tag/add', function(req, res, next) {
		add(req, res, next);
	});

	app.post('/api/tag/del', function(req, res, next) {
		del(req, res, next);
	});
}

function show(req, res, next) {
	Tag.find({})
		.exec(function(err, results) {
			if(err) {
				res.status(500).send({ error: err});
			} else {
				res.json(results);
			}
		});
}

function add(req, res, next) {
	if (!req.body.name)
			return res.status(400).send({ error: "Empty tag!" });
		Tag.findOne({ 'name': req.body.name }, function (err, tag) {
			if (err) {
				res.status(500).send({ error: err });
			} else {
				if (tag) {
					res.status(400).send({ error: "Tag already exist!" });
				} else {
		             var tag = new Tag({name: req.body.name || ""}); // Modified due to blank name error
		             tag.save(function(err){
		             	if (err) {
		             		res.status(400).send({ error: err });
		             	} else {
		             		res.status(200).send("Successfully added a tag!");
		             	}
             });
         }
     }
 	});
}

function del(req, res, next) {
	Tag.remove({ name: req.body.name},
		function (err, request) {
			if (err) {
				res.status(500).send({ error: err });
			} else {
				res.status(200).send("Successfully deleted a tag!");
			}
			res.end();
		}
	);
}
