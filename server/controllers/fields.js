var mongoose = require('mongoose');
var Field = mongoose.model('Field');

module.exports = (app) => {
	app.get('/api/v1/customField/show', function(req, res, next) {
	  show(req, res, next);
	});

	app.post('/api/v2/customField/add', function(req, res, next) {
	  add(req, res, next);
	});

	app.post('/api/v2/customField/del', function(req, res, next) {
	  del(req, res, next);
	});

	app.post('/api/v2/customField/update', function(req, res, next) {
	  update(req, res, next);
	});
}

function show(req, res) {
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}

function add(req, res) {
	if (! req.body.name) return res.status(400).send({ error: "Missing name" });
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}

function del(req, res) {
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}

function update(req, res) {
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}
