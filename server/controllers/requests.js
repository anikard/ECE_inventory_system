var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
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
	// .limit(parseInt(req.query.limit) || 20)
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
	if (id) {
		// Direct disbursal
		if (req.user.status != "admin" && req.user.status != "manager")
			return res.status(403).send({ error: "Unauthorized" });
		return direct(id, req, res);
	}
	// User request
	id = req.user._id;
	Cart.findOne({user: req.user._id})
	.exec( function(err, cart) {
		if (err)
			return res.status(500).send({ error: err });
		if (!cart || cart.items.length === 0)
			return res.status(400).send({ error: "Empty cart" });
		for (let i = 0;i<cart.items.length;i++){
			/*
			if (cart.items[i].item.quantity_available < cart.items[i].quantity)
				return res.status(405).send({ error: `Request quantity of ${cart.items[i].item.name} exceeds stock limit` });
				*/
		}
		let request = new Request({
        	user: id,
        	items: cart.items,
        	reason: req.body.reason || "",
			status: "outstanding",
			//type: req.body.type || "disburse"
    });
    request.save((err,request) => {
    	if (err) next(err);

			let name_arr = []
			cart.items.forEach(i=>name_arr.push(i.name));

			cart.items = [];


			cart.save((err)=>{
				if (err)
					return res.status(500).send({ error: err });
	    		let arr = [];
	    		request.items.forEach(i=>arr.push(i.item));

	    		email(request, `${req.user.name} added a new request`);

    			User.find({ 'subscribed': 'subscribed' }, function (err, users) {
    				if(err) return next(err);
    				if(!users.length) return;
    				let addresses = "";
    				for (var i = 0; i < users.length; i++) {
    					addresses = users[i].email?`${addresses},${users[i].email}`:addresses;
    				}
    				if (addresses) addresses = addresses.substring(1);
    				emailTo(request, addresses, `${req.user.name} added a new request`);
    			});

				let quantity_arr = [];
				request.items.forEach(i=>quantity_arr.push(i.quantity_requested));

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
				if (err) return res.status(500).send({ error: err });


				User.findOne({_id:id}, (err, user)=>{
					if (err) return next(err);
					email(request, `${user.name} received a new disbursement`);
				});

	    		let arr = []
	    		request.items.forEach(i=>arr.push(i.item));

				let quantity_arr = []
				request.items.forEach(i=>quantity_arr.push(i.quantity));

	    		let log = new Log({
					init_user: req.user,
					item: arr,
	 				event: "Request",
	 				rec_user: id,
	 				request: request,
					quantity: quantity_arr,
					name_list: name_arr,
					admin_actions: "disbursement"
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
			email(request, 'Your request has been updated');
			res.status(200).send("Successfully closed a request!");
		}
	);
}

function del (req, res) {
	Request.findOne({ _id: req.body._id})
	.populate('user items.item')
	.exec(function (err, request) {
		if (err) return next(err);
		request.remove((err)=>{
			if(err) return next(err);
			email(request, 'Your request has been deleted');
			if(request.user && request.user.email){
				let user = request.user;
				let body = "Request Summary\n";
				body += `User: ${user.name}(${user.username})\n`;
				body += `Reason: ${request.reason}\n`;
				body += `Note: ${request.note || 'N/A'}\n`;
				body += `Status: ${request.status}\n`;
				body += `Type: ${request.type}\n`;
				body += `Date: ${request.date}\n\n`;
				body += `Items:\n`;
				request.items.forEach(i=>body+=`Name: ${i.item.name}\t\tQuantity: ${i.quantity}\n`);
				mailer.send({
	    			to: request.user.email,
	    			subject: `Your request has been deleted`,
	    			text: body,
	    		});
			}
			res.status(200).send("Successfully deleted a request!");
		});

	});
}
function update (req, res) {
	Request.findOne({ '_id': req.body._id })
	.populate('items.item')
	.exec( function (err, request) {
		if (err) return res.status(500).send({ error: err});
		req.body.dateUpdated = Date.now;
		var logStats = generateLogStats(request.items, req.body.items);
		_.assign(request,_.pick(req.body,['user', 'reason', 'items', 'notes', 'dateUpdated']));
		request.save(function (err, request) {
			if (err) return res.status(500).send({ error: err});
			email(request, 'Your request has been updated');
			return res.status(200).json(request);
		});
	});
}

function email(request, subject){
	Request.findOne({_id: request._id})
	.populate('user items.item')
	.exec((err, request) => {
		if(err || !request.user || !request.user.email) return;
		let user = request.user;
		let body = "Request Summary\n";
		body += `User: ${user.name} (${user.username})\n`;
		body += `Reason: ${request.reason}\n`;
		body += `Note: ${request.note || 'N/A'}\n`;
		body += `Status: ${request.status}\n`;
		body += `Type: ${request.type}\n`;
		body += `Date: ${request.date}\n\n`;
		body += `Items:\n`;
		request.items.forEach(i=>body+=`Name: ${i.item.name}\t\tQuantity: ${i.quantity}\n`);
		mailer.send({
			to: user.email,
			subject: subject,
			text: body,
		});
	});

}

function emailTo(request, to, subject){
	Request.findOne({_id: request._id})
	.populate('user items.item')
	.exec((err, request) => {
		if(err || !request.user || !request.user.email) return;
		let user = request.user;
		let body = "Request Summary\n";
		body += `User: ${user.name} (${user.username})\n`;
		body += `Reason: ${request.reason}\n`;
		body += `Note: ${request.note || 'N/A'}\n`;
		body += `Status: ${request.status}\n`;
		body += `Type: ${request.type}\n`;
		body += `Date: ${request.date}\n\n`;
		body += `Items:\n`;
		request.items.forEach(i=>body+=`Name: ${i.item.name}\t\tQuantity: ${i.quantity}\n`);
		mailer.send({
			to: to,
			subject: subject,
			text: body,
		});
	});

}
