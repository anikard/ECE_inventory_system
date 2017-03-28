var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Tag = mongoose.model('Tag');
var util = require('./util.js');

module.exports = (app) => {
	app.get('/api/tag/show', util.requireLogin, show);
	app.post('/api/tag/add', util.requirePrivileged, add);
	app.post('/api/tag/del', util.requirePrivileged, del);
}

function show(req, res, next) {
	// We don't limit on tags, since there should not be so many tags that pagination is necessary
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
