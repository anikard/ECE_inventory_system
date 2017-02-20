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
		.populate('item user affected')
		.exec(function(err, results) {
			if(err) {
				res.status(500).send({ error: err});
			} else {
				res.status(200).json(results);
			}
		});
	});

	app.post('/api/v1/log/filter', function(req, res, next) {
		let query = _.pick(req.body,['user','item', 'affected']);
		if (req.body.startDate || req.body.endDate) {
			query.date = {};
			if (req.body.startDate) _.assign(query.date, {$gt:req.body.startDate});
			if (req.body.endDate) _.assign(query.date, {$lt:req.body.endDate});
		}
		console.log(query);
		Log.find(query)
		.populate('item user affected')
		.exec(function(err, results) {
			if(err) {
				res.status(500).send({ error: err});
			} else {
				res.status(200).json(results);
			}
		});
	});

}
