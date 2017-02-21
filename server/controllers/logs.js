var mongoose = require('mongoose');
var _ = require('lodash');
var Log = mongoose.model('Log');
var User = mongoose.model('User');

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
		.populate('item init_user rec_user')
		.exec(function(err, results) {
			if(err) {
				res.status(500).send({ error: err});
			} else {
				res.status(200).json(results);
			}
		});
	});

	app.post('/api/v1/log/filter', function(req, res, next) {
		let query = {};
		if (req.body.startDate || req.body.endDate) {
			query.date = {};
			if (req.body.startDate) _.assign(query.date, {$gt:req.body.startDate});
			if (req.body.endDate) _.assign(query.date, {$lt:req.body.endDate});
		}
		Log.find(query)
		.populate({
			path: 'init_user', 
			select: 'name username netId email status active',
			match: req.body.init_user ? { "name": { "$regex": req.body.init_user, "$options": "i" } } : {},
			options: { sort: { name: 1 }}
		})
		.populate({
			path: 'rec_user', 
			select: 'name username netId email status active',
			match: req.body.rec_user ? { "name": { "$regex": req.body.rec_user, "$options": "i" } } : {},
			options: { sort: { name: 1 }}
		})
		.populate({
			path: 'item', 
			match: req.body.item ? { "name": { "$regex": req.body.item, "$options": "i" } } : {},
		})
		.limit(20)
		.exec(function(err, results) {
			if(err) {
				res.status(500).send({ error: err});
			} else {
				res.status(200).json(results.filter(e=>e.init_user && e.item && (!req.body.rec_user || e.rec_user)));
			}
		});
	});

	// app.post('/api/v1/log/test/add', function(req, res, next) {
	// 	console.log("in /api/v1/log/test/add");
	// 	User.findOne({ 'status': 'admin' }, function (err, admin) {
	// 		User.findOne({ 'netId': 'ym67' }, function (err, user) {
	// 			let log = new Log({
	// 				init_user: admin,
	// 				item: "58ab62ceca32af82ffdef58b",
	// 				event: "borrow",
	// 				rec_user: "58961e117357635fb8c90466",
	// 			});
	// 			log.save(function(err, results) {
	// 				if(err) {
	// 					res.status(500).send({ error: err});
	// 				} else {
	// 					res.status(200).json(results);
	// 				}
	// 			});
	// 		});
	// 	});
	// });

}
