var mongoose = require('mongoose');
var _ = require('lodash');
var Request = mongoose.model('Request');
var Cart = mongoose.model('Cart');
var User = mongoose.model('User');
var Item = mongoose.model('Item');
var Log = mongoose.model('Log');
var util = require('./util.js');
var mailer = require('./mailer.js');
var _ = require('lodash');

module.exports = (app) => {

	app.get('/api/request/show', util.requireLogin, show);
	app.post('/api/request/add', util.requireLogin, add);
	app.post('/api/request/close', util.requireLogin, close);
	app.post('/api/request/del', util.requirePrivileged, del);
	app.post('/api/request/update', util.requirePrivileged, update);
}

function show (req, res) {
	let query = (req.user.status === "admin" || req.user.status === "manager") ? {} : { user : req.user._id };
	Request.find(query)
	.limit(parseInt(req.query.limit) || 20)
 	.populate('items.item user')
 	.sort('-date')
    .lean()
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
       		results.forEach(function(e){
       			e.customer_name = e.user?e.user.name:"";
       			e.item_name = e.item?e.item.name:"";

       		});
         	res.json(results);
       	}
    });
}

function add (req, res) {
	let id = req.body.user || req.body.userId || req.body._id;
	if(req.body.convert) {
		// From Converted Request
		return convert(id, req, res);
	}
	if (id) {
		// Direct disbursal
		if (req.user.status != "admin" && req.user.status != "manager")
			return res.status(403).send({ error: "Unauthorized" });
		return direct(id, req, res);
	}
	// User request
	id = req.user._id;
	Cart.findOne({user: req.user._id})
	.populate('items.item')
	.exec( function(err, cart) {
		if (err)
			return res.status(500).send({ error: err });
		if (!cart || cart.items.length === 0)
			return res.status(400).send({ error: "Empty cart" });
		for (let i = 0;i<cart.items.length;i++){
			if (cart.items[i].item.quantity_available < cart.items[i].quantity)
				return res.status(405).send({ error: `Request quantity of ${cart.items[i].item.name} exceeds stock limit` });
		}
		let request = new Request({
        	user: id,
        	items: cart.items,
        	reason: req.body.reason || "",
			status: "outstanding",
			type: req.body.type || "disburse"
        });
        request.save((err,request) => {
        	if (err)
				return res.status(500).send({ error: err });

			let name_arr = []
			cart.items.forEach(i=>name_arr.push(i.name));

			cart.items = [];


			cart.save((err)=>{
				if (err)
					return res.status(500).send({ error: err });
	    		let arr = [];
	    		request.items.forEach(i=>arr.push(i.item));

	    		mailer.send({
	    			to: req.user.email,
	    			subject: `${req.user.username} added a new request`,
	    			text: JSON.stringify(request),
	    		});

    			User.find({ 'subscribed': 'subscribed' }, function (err, users) {
    				if(err) return next(err);
    				if(!users.length) return;
    				let addresses = users[0].email;
    				for (var i = 1; i < users.length; i++) {
    					addresses = `${addresses},${users[i].email}`;
    				}
    				mailer.send({
    					to: addresses,
    					subject: `${req.user.username} added a new request`,
    					text: JSON.stringify(request),
    				});
    			});

				let quantity_arr = [];
				request.items.forEach(i=>quantity_arr.push(i.quantity));

				let name_arr = [];
				request.items.forEach(i=>name_arr.push(i.item.name));

	    		let log = new Log({
					init_user: id,
					item: arr,
	 				event: "Request",
	 				request: request,
	 				rec_user: id,
					quantity: quantity_arr,
					name_list: name_arr
				});
				log.save((err)=>{
					if (err)
						return res.status(500).send({ error: err });
					return res.status(200).json(request);
				});
			});
		});
	});
}

function convert(id, req, res) {
	let request = new Request({
		user: id,
		items: req.body.items,
		reason: req.body.reason || "",
		status: req.body.status || "outstanding",
		type: req.body.type || "disburse"
	});
	request.save((err,request) => {
		if (err) {
			return res.status(500).send({ error: err });
		}
		request.populate('items.item', function(err, request) {
			if (request.status === "disbursed") {
				for (let i = 0;i<request.items.length;i++){

					if (req.body.previousStatus === "outstanding") {
						request.items[i].item.quantity -= req.body.items[i].quantity;
						request.items[i].item.quantity_available -= req.body.items[i].quantity;
					}
					else if (req.body.previousStatus === "onLoan") {
						request.items[i].item.quantity -= req.body.items[i].quantity;
					}
					else {
						console.log("Error in converted disbursment");
					}
					request.items[i].item.save();
				}
			}

			if (request.status === "onLoan") {
				for (let i = 0;i<request.items.length;i++){
					request.items[i].item.quantity_available -= req.body.items[i].quantity;
					request.items[i].item.save();
				}
			}

			if (request.status === "returned") {
				for (let i = 0;i<request.items.length;i++){
					request.items[i].item.quantity_available += req.body.items[i].quantity;
					request.items[i].item.save();
				}
			}

			User.findOne({ _id: id}, (err, user)=>{
				if (err) return next(err);
				let options = {
	    			to: user.email,
	    			subject: `Request update for ${req.user.name}`,
	    			text: JSON.stringify(request),
	    		};
				mailer.send(options);
			});

			let name_arr = []
			req.body.items.forEach(i=>name_arr.push(i.name));
			let arr = []
			request.items.forEach(i=>arr.push(i.item));
			let quantity_arr = []
			request.items.forEach(i=>quantity_arr.push(i.quantity));

			let log = new Log({
					init_user: id,
					item: arr,
					event: "Request",
					request: request,
					rec_user: id,
					quantity: quantity_arr,
					name_list: name_arr
			});
			log.save((err)=>{
				if (err)	{
					return res.status(500).send({ error: err });
				}
				return res.status(200).json(request);
			});
		});
	});
}

function direct (id, req, res) {
	Cart.findOne({user: req.user})
	.populate('items.item')
	.exec(function(err, cart) {
		if (err)
			return res.status(500).send({ error: err });
		if (!cart || cart.items.length === 0)
				return res.status(400).send({ error: "Empty Cart" });
		for (let i = 0;i<cart.items.length;i++){
			if (cart.items[i].item.quantity_available < cart.items[i].quantity)
				return res.status(405).send({ error: `Request quantity of ${cart.items[i].item.name} exceeds stock limit` });
		}
		let currentStatus = {};
		if (req.body.type === "loan") {
			currentStatus = "onLoan";
		}
		else if (req.body.type === "disburse") {
			currentStatus = "disbursed";
		}
		let request = new Request({
        	user: id,
        	items: cart.items,
        	reason: req.body.reason || "",
        	note: req.body.note || "",
					status: currentStatus,
					type: req.body.type,
        });
        for (let i = 0;i < cart.items.length;i++){
			if (req.body.type === "disburse") {
				cart.items[i].item.quantity -= cart.items[i].quantity;
				cart.items[i].item.quantity_available -= cart.items[i].quantity;
			}
			else if (req.body.type === "loan") {
				cart.items[i].item.quantity_available -= cart.items[i].quantity;
			}
		}
        request.save((err,request) => {
        	if (err)
				return res.status(500).send({ error: err });
			for (let i = 0;i<cart.items.length;i++){
				cart.items[i].item.save();
			}

			let name_arr = []
			cart.items.forEach(i=>name_arr.push(i.name));


			cart.items = [];
			cart.save((err)=>{
				if (err)
					return res.status(500).send({ error: err });

				User.findOne({_id:id}, (err, user)=>{
					if (err) return next(err);
					let options = {
		    			to: user.email,
		    			subject: `${req.user.username} received a new disbursement`,
		    			text: JSON.stringify(request),
		    		};
					mailer.send(options);
				});

	    		let arr = []
	    		request.items.forEach(i=>arr.push(i.item));

				let quantity_arr = []
				request.items.forEach(i=>quantity_arr.push(i.quantity));

	    		let log = new Log({
					init_user: req.user,
					item: arr,
	 				event: "Disbursement",
	 				rec_user: id,
					quantity: quantity_arr,
					name_list: name_arr
				});
				log.save((err)=>{
					if (err)
						return res.status(500).send({ error: err });
					return res.status(200).json(request);
				});
			});
		});
	});
}

function close (req, res)  {
	Request.findByIdAndUpdate(
		req.body._id,
		{ $set: {
			status: "closed",
		}},
		{ new: true },
		function (err, request) {
			request.populate('user', (err, request) => {
				if (err) return next(err);
				if (request.user && request.user.email)
					mailer.send({
		    			to: request.user.email,
		    			subject: `Your request has been closed`,
		    			text: JSON.stringify(request),
		    		});
				res.status(200).send("Successfully closed a request!");
			});
		}
	);
}

function del (req, res) {
	Request.findOne({ _id: req.body._id})
	.populate('user')
	.exec(function (err, request) {
		if (err) return next(err);
		request.remove((err)=>{
			if(err) return next(err);
			if(request.user && request.user.email)
				mailer.send({
	    			to: request.user.email,
	    			subject: `Your request has been deleted`,
	    			text: JSON.stringify(request),
	    		});
			res.status(200).send("Successfully deleted a request!");
		});

	});
}

function update (req, res) {
	Request.findOne({ '_id': req.body._id })
	.populate('items.item')
	.exec( function (err, request) {
		if (err) return res.status(500).send({ error: err});

		// TODO: refactor the following if tree into one clause
		if (request.status === "outstanding" && req.body.status === "disbursed") {
			if (req.user.status != "admin" && req.user.status != "manager")
				return res.status(401).send({ error: "Unauthorized operation"});
			for (let i = 0;i<request.items.length;i++){
				if (request.items[i].item.quantity_available < request.items[i].quantity)
					return res.status(405).send({
						error: `Request quantity of ${request.items[i].item.name} exceeds stock limit`
					});
			}
			for (let i = 0;i<request.items.length;i++){
				request.items[i].item.quantity -= request.items[i].quantity;
				request.items[i].item.quantity_available -= request.items[i].quantity;
			}
			request.note = req.body.note || request.note;
			request.status = "approved";
			request.save(function (err, request) {
				if (err) return res.status(500).send({ error: err});
				for (let i = 0;i<request.items.length;i++){
					request.items[i].item.save();
				}

				let arr = []
	    		request.items.forEach(i=>arr.push(i.item));

				let quantity_arr = []
				request.items.forEach(i=>quantity_arr.push(i.quantity));

				let name_arr = []

				request.items.forEach(i=>name_arr.push(i.item.name));

				User.findOne({_id: request.user}, (err, user) =>{
				if (err) return next(err);
				if (user && user.email)
					mailer.send({
		    			to: request.user.email,
		    			subject: `Your request has been approved`,
		    			text: JSON.stringify(request),
		    		});
				});

	    		let log = new Log({
					init_user: req.user,
					item: arr,
	 				event: "Request",
	 				request: request,
	 				rec_user: request.user,
	 				admin_actions: "Approve",
					quantity: quantity_arr,
					name_list: name_arr
				});
				log.save();
				return res.status(200).json(request);
			});
		}

		else if (req.body.previous_status === "onLoan" && req.body.status === "disbursed") {
			if (req.user.status != "admin" && req.user.status != "manager")
				return res.status(401).send({ error: "Unauthorized operation"});
				/*
			for (let i = 0;i<request.items.length;i++){
				if (request.items[i].item.quantity < request.items[i].quantity)
					return res.status(405).send({
						error: `Request quantity of ${request.items[i].item.name} exceeds stock limit`
					});
			}
			*/
			for (let i = 0;i<request.items.length;i++){
				request.items[i].item.quantity -= request.items[i].quantity;
				//request.items[i].item.quantity_available -= request.items[i].quantity;
			}
			request.note = req.body.note || request.note;
			request.status = "disbursed";
			request.save(function (err, request) {
				if (err) return res.status(500).send({ error: err});
				for (let i = 0;i<request.items.length;i++){
					request.items[i].item.save();
				}

				User.findOne({_id: request.user}, (err, user) =>{
				if (err) return next(err);
				if (user && user.email)
					mailer.send({
		    			to: request.user.email,
		    			subject: `Your request onLoan -> disbursed`,
		    			text: JSON.stringify(request),
		    		});
				});

				let arr = []
				request.items.forEach(i=>arr.push(i.item));

				let quantity_arr = []
				request.items.forEach(i=>quantity_arr.push(i.quantity));

				let name_arr = []
				request.items.forEach(i=>name_arr.push(i.item.name));

				let log = new Log({
					init_user: req.user,
					item: arr,
					event: "Request",
					request: request,
					rec_user: request.user,
					admin_actions: "onLoan to disburse",
					quantity: quantity_arr,
					name_list: name_arr
				});
				log.save();
				return res.status(200).json(request);
			});
		}

		else if (req.body.status === "onLoan") {
			if (req.user.status != "admin" && req.user.status != "manager") {
				return res.status(401).send({ error: "Unauthorized operation"});
			}
			for (let i = 0;i<request.items.length;i++){
				if (request.items[i].item.quantity_available < request.items[i].quantity)
					return res.status(405).send({
						error: `Request quantity of ${request.items[i].item.name} exceeds stock limit`
					});
			}
			for (let i = 0;i<request.items.length;i++){
				request.items[i].item.quantity_available -= request.items[i].quantity;
			}
			request.note = req.body.note || request.note;
			request.status = req.body.status;
			request.type = "loan";
			request.save(function (err, request) {
				if (err) return res.status(500).send({ error: err});
				for (let i = 0;i<request.items.length;i++){
					request.items[i].item.save();
				}

				User.findOne({_id: request.user}, (err, user) =>{
				if (err) return next(err);
				if (user && user.email)
					mailer.send({
		    			to: request.user.email,
		    			subject: `Loan request`,
		    			text: JSON.stringify(request),
		    		});
				});

				let arr = []
				request.items.forEach(i=>arr.push(i.item));

				let quantity_arr = []
				request.items.forEach(i=>quantity_arr.push(i.quantity));

				let name_arr = []
				request.items.forEach(i=>name_arr.push(i.item.name));

				let log = new Log({
					init_user: req.user,
					item: arr,
					event: "Request",
					request: request,
					rec_user: request.user,
					admin_actions: "Loan",
					quantity: quantity_arr,
					name_list: name_arr
				});
				log.save();
				return res.status(200).json(request);
			});
		}

		else if (req.body.status === "returned") {
			if (req.user.status != "admin" && req.user.status != "manager") {
				return res.status(401).send({ error: "Unauthorized operation"});
			}
			for (let i = 0;i<request.items.length;i++){
				request.items[i].item.quantity_available += request.items[i].quantity;
			}
			request.note = req.body.note || request.note;
			request.status = req.body.status;
			request.save(function (err, request) {
				if (err) return res.status(500).send({ error: err});
				for (let i = 0;i<request.items.length;i++){
					request.items[i].item.save();
				}

				User.findOne({_id: request.user}, (err, user) =>{
				if (err) return next(err);
				if (user && user.email)
					mailer.send({
		    			to: request.user.email,
		    			subject: `Your request has been returned`,
		    			text: JSON.stringify(request),
		    		});
				});

				let arr = []
				request.items.forEach(i=>arr.push(i.item));

				let quantity_arr = []
				request.items.forEach(i=>quantity_arr.push(i.quantity));

				let name_arr = []
				request.items.forEach(i=>name_arr.push(i.item.name));

				let log = new Log({
					init_user: req.user,
					item: arr,
					event: "Request",
					request: request,
					rec_user: request.user,
					admin_actions: "Return",
					quantity: quantity_arr,
					name_list: name_arr
				});
				log.save();
				return res.status(200).json(request);
			});
		}

		else {
			_.assign(request,_.pick(req.body,['note','status','type','reason','user']));
			request.save(function (err, request) {
				if (err) return res.status(500).send({ error: err});
				User.findOne({_id: request.user}, (err, user) =>{
				if (err) return next(err);
				if (user && user.email)
					mailer.send({
		    			to: request.user.email,
		    			subject: `Your request has been updated`,
		    			text: JSON.stringify(request),
		    		});
				});
				return res.status(200).json(request);
			});
		}
	});
}
