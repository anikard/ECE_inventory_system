var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var _ = require('lodash');
var Request = mongoose.model('Request');
var Cart = mongoose.model('Cart');
var User = mongoose.model('User');
var Item = mongoose.model('Item');
var Log = mongoose.model('Log');
var Backfill = mongoose.model('Backfill');
var util = require('./util.js');
var mailer = require('./mailer.js');
var backfiller = require('./backfill.js');
var _ = require('lodash');

module.exports = (app) => {

	app.get('/api/request/show', util.requireLogin, show);
	app.post('/api/request/findOne', util.requireLogin, findOneRequest);
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

function findOneRequest(req, res, next) {
	Request.findOne({_id:req.body._id||req.body.id||req.body.request})
	.exec((err,request)=>{
		if(err) return next(err);
		if(!request) return next({status:400,error:"No such request"});
		request = request.toJSON();
		Backfill.find({request:request._id}, (err,results)=>{
			//some error checking before...
			request.backfills = results;
			res.status(200).send(request);
		});
		//res.send(500).send({error: "Find one error"});
	})
}

function add (req, res) {
	var direct = true;
	let id = req.body.user || req.body.userId || req.body._id;

	if (id) {
		// Direct disbursal
		if (req.user.status != "admin" && req.user.status != "manager") {
			return res.status(403).send({ error: "Unauthorized" });
		}
		for(var i = 0; i < req.body.items.length; i++) {
			req.body.type === "disburse" ?
			req.body.items[i].quantity_disburse = req.body.items[i].quantity_requested :
			req.body.items[i].quantity_loan = req.body.items[i].quantity_requested;
			req.body.items[i].quantity_requested = 0;
		}
	}

	if(!id) {
		// User request
		console.log("USER REQ");
		id = req.user._id;
		direct = false;
	}

	Cart.findOne({user: req.user._id})
	//.populate('items.item')
	.exec( function(err, cart) {
		if (err)
			return res.status(500).send({ error: err });
		if (!cart || cart.items.length === 0)
			return res.status(400).send({ error: "Empty cart" });

		console.log("&&&&&&&&&&&&7: " + cart);
		console.log("*************:");
		consoel.log

		for(var i = 0; i < req.body.items.length; i++) {
			req.body.items[i].type = req.body.type;
			var disburseOrLoanAmount =
				(req.body.items[i].quantity_disburse) ?
				req.body.items[i].quantity_disburse :
				req.body.items[i].quantity_loan;
			if (req.body.items[i].item.quantity_available < disburseOrLoanAmount) {
				return res.status(405).send({ error: `Request quantity of ${req.body.items[i].item.name} exceeds stock limit` });
			}
			/*
			else{
				req.body.items[i].item = req.body.items[i].item._id;
				req.body.items[i].item.quantity_available -= req.body.items[i].quantity_disburse + req.body.items[i].quantity_loan;
				req.body.items[i].item.quantity -= req.body.items[i].quantity_disburse;
				req.body.items[i].item.save((err, success) => {
					if(err) console.log("&&*&*&*&*&*: " + err);
					if(success) console.log("%%%%%%%% " + success);
				})
			}
			*/
		}
/*
		Request.create({
			user: id,
			items: req.body.items,
			reason: req.body.reason || "",
			type: req.body.type || "disburse"
		}, function (err, request))

*/
		let request = new Request({
        	user: id,
        	items: req.body.items,
        	reason: req.body.reason || "",
					type: req.body.type || "disburse",
    });
/*
		for(var i = 0; i < request.items.length; i++) {

		}
		*/

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
	.populate('items.item backfills')
	//.populate('backfills.backfill')
	.exec( function (err, request) {
		if (err) return res.status(500).send({ error: err});
		var updateCheckString = updateCheck(request, request.items, req.body.items);
		if (updateCheckString != "") {
			return res.status(403).send({ err: updateCheckString });
		}
		var nowDate = new Date();
		var nowISO = nowDate.toISOString();
		req.body.dateUpdated = nowISO;
		//var logStats = generateLogStats(request.items, req.body.items);

		var logStats = {};
		for (var i = 0; i < request.items.length; i++) {
			var quantity_and_available_delta = request.items[i].quantity_disburse - req.body.items[i].quantity_disburse;
			var quantity_available_only_delta =
				(req.body.items[i].loan_return - req.body.items[i].outstanding_loan);
			console.log("log stats");
			console.log(request.items[i].item.name);
			console.log(quantity_and_available_delta);
			console.log(quantity_available_only_delta);
			request.items[i].item.quantity += quantity_and_available_delta;
			request.items[i].item.quantity_available +=
				(quantity_and_available_delta + quantity_available_only_delta);
		}

		for (let i = 0; i < request.items.length; i++) {
			console.log("Quantity available");
			console.log(request.items[i].item.quantity_available);
			request.items[i].item.save(function (err, success) {
				console.log("Err: " + err);
				console.log("Suc: " + success);
			});
		}

		for (let i = 0; i < req.body.backfills.length; i++) {
			Backfill.findOne({_id: req.body.backfills[i]._id}, (err, backfill) => {
				backfill.status = req.body.backfills[i].status;
				backfill.save(function(err, success) {
					console.log("BFE: " + err);
					console.log("BFS: " + success);
				});
			});
		}

		console.log("REQUESTE BEFORE: " + request)
		_.assign(request,_.pick(req.body,['user', 'reason', 'items', 'notes', 'dateUpdated']));
		console.log("REQUEST AFTER: " + request);
		request.save(function (err) {

			if (err) return res.status(500).send({ error: err});
			email(request, 'Your request has been updated');
			return res.status(200).json(request);
		});
	});
}

function updateCheck(request, oldItems, newItems) {
	var newBackfills = [];
	for (var i = 0; i < oldItems.length; i++) {
		var quantityAvailable = oldItems[i].item.quantity_available;
		console.log("QA");
		console.log(quantityAvailable);
		var quantityDelta = generateQuantityDeltas(oldItems[i], newItems[i]);
		console.log(quantityDelta);
		if (quantityDelta.disburse_delta > quantityAvailable || quantityDelta.loan_delta > quantityAvailable) {
			return "Quantities acted on exceed quantities available";
		}
		if (quantityDelta.total_delta > oldItems[i].quantity_requested) {
			return "Quantities acted on exceed quantities requested";
		}
		if (quantityDelta.backfill_delta > 0) {
			var newBackfill = {
				item: oldItems[i].item,
				quantity: quantityDelta.backfill_delta
			};
			newBackfills.push(newBackfill);
			//generateNewBackfill(request, oldItems[i].item, quantityDelta.backfill_delta);
		}
	}
	if (newBackfills.length > 0) generateNewBackfill(request, newBackfills);
	return "";
}

function generateQuantityDeltas(oldItem, newItem) {
	var delta = {};
	delta.disburse_delta = newItem.quantity_disburse - oldItem.quantity_disburse;
	delta.loan_delta = newItem.quantity_loan - oldItem.quantity_loan;
	delta.deny_delta = newItem.quantity_deny = oldItem.quantity_deny;
	delta.cancel_delta = newItem.quantity_cancel = oldItem.quantity_cancel;
	delta.total_delta = delta.disburse_delta + delta.loan_delta + delta.deny_delta
	+ delta.cancel_delta;
	delta.backfill_delta = newItem.quantity_backfill - oldItem.quantity_backfill;
	return delta;
}

function generateNewBackfill(request, backfillItems) {
	console.log("backfill");
	console.log(backfillItems);
	Backfill.create({ items: backfillItems, request: request._id }, function (err, bf) {
		if (err) {
			console.log("BF ERR: " + err);
		}
		else {
			console.log("BF SUCC: " + bf);
		}
	});

}

function generateLogStats(oldItems, newItems) {
	// TODO: BROKEN: Ask mike how to update the item quantity and q_avail in this function
	var logStats = {};
	for (var i = 0; i < oldItems.length; i++) {
		var quantity_and_available_delta = oldItems[i].quantity_disburse - newItems[i].quantity_disburse;
		var quantity_available_only_delta =
			(newItems[i].loan_return - newItems[i].outstanding_loan);
		console.log("log stats");
		console.log(oldItems[i].item.name);
		console.log(quantity_and_available_delta);
		console.log(quantity_available_only_delta);
		oldItems[i].item.quantity += quantity_and_available_delta;
		oldItems[i].item.quantity_available +=
			(quantity_and_available_delta + quantity_available_only_delta);
	}
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
