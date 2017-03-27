var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var _ = require('lodash');
var Log = mongoose.model('Log');
var User = mongoose.model('User');
var Item = mongoose.model('Item');
var util = require('./util.js');


module.exports = (app) => {
	app.use('/api/log/*', util.requireLogin);

	app.get('/api/log/show', show);

	app.post('/api/log/item', function(req, res, next) {
		Item.findOne({ 'name': req.body.name }, function (err, item) {
			if(err) {
	         	console.log(err);
	         	return null;
	       	} else {
	         	res.json(item);
	       	}
		})
	});

	app.get('/api/log/filter', filter);
	app.post('/api/log/filter', filter);

	 //app.post('/api/log/add', function(req, res, next) {
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
	 //});

}

function show(req, res, next) {
	Log.find({})
 	.populate('rec_user init_user item')
	.sort('-date')
	.limit(parseInt(req.body.limit) || parseInt(req.query.limit) || 20)
	.exec(function(err, results) {
		if(err) {
			res.status(500).send({ error: err});
		} else {
			res.status(200).json(results);
		}
	});
}

function filter(req, res, next) {
	req.body = req.body || req.query;
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
	.limit(parseInt(req.body.limit) || 20)
	.exec(function(err, results) {
		if(err) {
			res.status(500).send({ error: err});
		} else {
			res.status(200).json(results.filter(e=>e.init_user && e.item && (!req.body.rec_user || e.rec_user)));
		}
	});
}
