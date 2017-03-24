var mongoose = require('mongoose');
var _ = require('lodash');
var Request = mongoose.model('Request');
var Cart = mongoose.model('Cart');
var User = mongoose.model('User');
var Item = mongoose.model('Item');
var Log = mongoose.model('Log');
var util = require('./util.js');

module.exports = (app) => {

	app.get('/api/request/show', util.requireLogin, show);
	app.post('/api/request/add', util.requireLogin, add);
	app.post('/api/request/close', util.requireLogin, close);
	app.post('/api/request/del', util.requirePrivileged, del);
	app.post('/api/request/update', util.requirePrivileged, update);
}

var findRequestsByUser = function(name) {
	Request.find({})
 	.populate('item user')
 	.exec(function(err, results) {
       	if(err) {
         	console.log(err);
         	return null;
       	} else {
       		results.forEach(function(e){
       			e.customer_name = e.user.name;
       		});
         	return results;
       	}
		});
};

var findRequestsByItem = function(item) {
	Request.find({})
 	.populate('item user')
     	.exec(function(err, results) {
       	if(err) {
         	console.log(err);
         	return null;
       	} else {
       		results.forEach(function(e){
       			e.customer_name = e.user.name;
       		});
         	return results;
       	}
		});
};

var findUserByName = function(name) {
	User.findOne({ 'name': name }, function (err, user) {
		if(err) {
         	console.log(err);
         	return null;
       	} else {
         	return user;
       	}
	})
};

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
	console.log("add");
	console.log(req.body.items);
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
		let request = new Request({
        	user: id,
        	items: cart.items,
        	reason: req.body.reason || "",
					status: "open",
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
					if (err)
						return res.status(500).send({ error: err });
					return res.status(200).json(request);
				});
			});
		});
	});
}

function convert(id, req, res) {
	console.log("convert items");
	console.log(req.body.items);
	let request = new Request({
				user: id,
				items: req.body.items,
				reason: req.body.reason || "",
				status: req.body.status || "open",
				type: req.body.type || "disburse"
	});
	request.save((err,request) => {
		if (err) {
			return res.status(500).send({ error: err });
		}
		request.populate('items.item', function(err, request) {
/*
			console.log("conv status");
			console.log(request.status);
			console.log("@@@@@@@@@@@@@@@");
			console.log(req.body.items);
			console.log("&&&&&&&&&&&&&&&");
			console.log(request.items);
			console.log("***************");
			*/
			if (request.status === "disbursed") {
				//console.log("in disbursed status of convert");
				for (let i = 0;i<request.items.length;i++){

					/*
					console.log(request.items[i])
					console.log(req.body.items[i])
					console.log(request.items[i].item.quantity);
					console.log("quantity check");
					console.log(request.items[i].item.quantity);
					*/

					request.items[i].item.quantity -= req.body.items[i].quantity;
					request.items[i].item.quantity_available -= req.body.items[i].quantity;
					request.items[i].item.save();
					//console.log(request.items[i].item.quantity);
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


			let name_arr = []
			req.body.items.forEach(i=>name_arr.push(i.name));

			//cart.items = [];


			//cart.save((err)=>{
				//if (err)
					//return res.status(500).send({ error: err });
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
			if (cart.items[i].item.quantity < cart.items[i].quantity)
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
	// Customer.update(
			// 		{_id: req.body._customer},
   //                 	{ $pull: { orders: req.body._id} }
   //               );
	request.findByIdAndUpdate(
		req.body._id,
		{ $set: {
			status: "closed",
		}},
		{ new: true },
		function (err, request) {
			if (err) console.log("Error");
			res.end();
		}
	);
}

function del (req, res) {
	Request.remove({ _id: req.body._id},
		function (err, request) {
			if (err) {
				res.status(500).send({ error: err });
			} else {
    			res.status(200).send("Successfully deleted an order!");
			}

			res.end();
		}
	);
}

function update (req, res) {
	Request.findOne({ '_id': req.body._id })
	.populate('items.item')
	.exec( function (err, request) {
		if (err) return res.status(500).send({ error: err});

		if (request.status === "open" && req.body.status === "disbursed") {
			if (req.user.status != "admin" && req.user.status != "manager")
				return res.status(401).send({ error: "Unauthorized operation"});
			for (let i = 0;i<request.items.length;i++){
				if (request.items[i].item.quantity < request.items[i].quantity)
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

		else if (req.body.status === "onLoan") {
			if (req.user.status != "admin" && req.user.status != "manager") {
				return res.status(401).send({ error: "Unauthorized operation"});
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
				return res.status(200).json(request);
			});
		}
	});
}
