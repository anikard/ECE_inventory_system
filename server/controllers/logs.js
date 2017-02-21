var mongoose = require('mongoose');
var _ = require('lodash');
var Log = mongoose.model('Log');

module.exports = (app) => {
	app.get('/api/v1/log/show', function(req, res, next) {
		Log.find({})
			.exec(function(err, results) {
				if(err) {
					res.status(500).send({ error: err});
				} else {
					res.status(200).json(results);
				}
			});
	});

	app.get('/api/v1/log/filter', function(req, res, next) {
		Log.find(_.pick(req.query,['user','item']))
			.exec(function(err, results) {
				if(err) {
					res.status(500).send({ error: err});
				} else {
					res.status(200).json(results);
				}
			});
	});

	app.post('/api/v1/log/filter', function(req, res, next) {
		Log.find(_.pick(req.body,['user','item']))
			.exec(function(err, results) {
				if(err) {
					res.status(500).send({ error: err});
				} else {
					res.status(200).json(results);
				}
			});
	});

}
