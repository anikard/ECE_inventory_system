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
	app.all('/api/request/findOne', util.requireLogin, findOneRequest);
	app.post('/api/request/add', util.requireLogin, add);
	app.post('/api/request/close', util.requireLogin, close);
	app.post('/api/request/del', util.requirePrivileged, del);
	app.post('/api/request/update', util.requireLogin, update);

	app.get('/api/request/showbackfillrequested', util.requireLogin, (req, res, next)=>{
		let query = {status: 'requested'};
		let isAdmin = req.user.status=='admin' || req.user.status=='manager';
		Backfill.find(query)
		.populate('request')
		.exec((err, bfs)=>{
			if(err)return next(err);
			let requests = new Set();
			bfs.forEach(b=>{if(isAdmin || b.request.user.equals(req.user._id))requests.add(b.request)});
			let arr = [];
			requests.forEach(r=>arr.push(r));
			res.status(200).send(arr);
		})
		// Request.find({ backfills: { $exists: true, $not: {$size: 0} } })
		// .populate('backfills')
		// .exec((err, requests)=>{
		// 	if (err) return next(err);
		// 	res.status(200).send(requests.filter(r=>{
		// 		let flag = false;
		// 		r.backfills.forEach(b=>flag = flag || b.status==='requested');
		// 		return flag;
		// 	}))
		// })
	});

	app.get('/api/request/showbackfilltransit', util.requireLogin, (req, res, next)=>{
		let query = {status: 'inTransit'};
		let isAdmin = req.user.status=='admin' || req.user.status=='manager';
		Backfill.find(query)
		.populate('request')
		.exec((err, bfs)=>{
			if(err)return next(err);
			let requests = new Set();
			bfs.forEach(b=>{if(isAdmin || b.request.user.equals(req.user._id))requests.add(b.request)});
			let arr = [];
			requests.forEach(r=>arr.push(r));
			res.status(200).send(arr);
		})
	})
}

/*
GET request
optional parameters: user, type
*/
function show (req, res) {
	let query = (req.user.status === "admin" || req.user.status === "manager") ? {} : { user : req.user._id };
	_.assign(_.pick(req.query, ['user','type']));
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

/*
GET or POST
parameter:
request: request id
Return: one request that matches the id
*/
function findOneRequest(req, res, next) {
	let id = req.body._id||req.body.id||req.body.request
				|| req.query._id||req.query.id||req.query.request;
	Request.findOne({_id:id})
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

/*
POST
parameter:
user: id of the user which direct disbursal is given to
type: string of request type
*/
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
		id = req.user._id;
		direct = false;
	}

	Cart.findOne({user: req.user._id})
	.exec( function(err, cart) {
		if (err)
			return res.status(500).send({ error: err });
		if (!cart || cart.items.length === 0)
			return res.status(400).send({ error: "Empty cart" });

		for(var i = 0; i < req.body.items.length; i++) {
			req.body.items[i].type = req.body.type;
			var disburseOrLoanAmount =
				(req.body.items[i].quantity_disburse) ?
				req.body.items[i].quantity_disburse :
				req.body.items[i].quantity_loan;
			if (req.body.items[i].item.quantity_available < disburseOrLoanAmount) {
				return res.status(405).send({ error: `Request quantity of ${req.body.items[i].item.name} exceeds stock limit` });
			}
		}

		var newRequest = new Request({
        	user: id,
        	items: req.body.items,
        	reason: req.body.reason || "",
					type: req.body.type || "disburse"
    });

		var promise = newRequest.save();
		promise.then(function(requestPromise) {

			Request.findById(requestPromise._id)
			.populate('items.item')
			.exec(function (err, request){

				for (var i = 0; i < request.items.length; i++) {
					request.items[i].item.quantity_available -= request.items[i].quantity_disburse + request.items[i].quantity_loan;
					request.items[i].item.quantity -= request.items[i].quantity_disburse;
					request.items[i].item.save((err, success) => {
						if(err) {
							console.log("RP ERR: " +err);
						}
						if(success) {
							console.log("RP SUCC: " + success);
						}
					})
				}

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
	});
}

/*
POST
parameter:
id: id of the request
*/
function close (req, res)  {
	Request.findByIdAndUpdate(
		req.body._id || req.body.id || req.body.request,
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

/*
POST
parameter:
id: id of the request
*/
function del (req, res) {
	Request.findOne({ _id: req.body._id || req.body.id || req.body.request})
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

/*
POST
parameter:
id: id of the request
*/
function update (req, res) {
	Request.findOne({ '_id': req.body._id || req.body.id || req.body.request })
	.populate('items.item backfills')
	.exec( function (err, request) {
		if (err) return res.status(500).send({ error: err});
		var updateCheckString = updateCheck(request, req.body.items);
		if (updateCheckString != "") {
			return res.status(403).send({ err: updateCheckString });
		}
		req.body.dateUpdated = new Date().toISOString();

		//saveAssets(request, req);
		_.assign(request, _.pick(req.body, ['assets']));

		generateBackfills(request, req.body.items);
		saveBackfills(request, req);

		updateItemQuantities(request, req);
		req.body.items = refreshRequestQuantities(req);

		_.assign(request,_.pick(req.body,['user', 'reason', 'items', 'notes', 'dateUpdated']));
		request.save(function (err) {

			if (err) return res.status(500).send({ error: err});
			email(request, 'Your request has been updated');
			return res.status(200).json(request);
		});
	});
}

function updateCheck(request, newItems) {
	for (var i = 0; i < request.items.length; i++) {
		var quantityAvailable = request.items[i].item.quantity_available;

		var quantityMadeUnavailable = newItems[i].quantity_outstanding_disburse + newItems[i].quantity_loan_disburse
		if (quantityMadeUnavailable > quantityAvailable) {
			return "Quantities acted on exceed quantities available";
		}

		var quantityActedOutstanding = newItems[i].quantity_outstanding_disburse + newItems[i].quantity_outstanding_loan
		+ newItems[i].quantity_outstanding_deny + newItems[i].quantity_outstanding_backfill;
		if (quantityActedOutstanding > request.items[i].quantity_requested) {
			return "Quantities acted on exceed quantities requested";
		}

		var quantityActedLoan = newItems[i].quantity_loan_disburse + newItems[i].quantity_loan_return
		+ newItems[i].quantity_loan_backfill;
		if (quantityActedLoan > request.items[i].quantity_loan) {
			return "Quantities acted on exceed quantities requested";
		}
	}
	return "";
}

function updateItemQuantities(request, req) {
	for (var i = 0; i < request.items.length; i++) {
		var quantity_and_available_delta = 0 - req.body.items[i].quantity_outstanding_disburse;
		var quantity_only_delta = 0 - req.body.items[i].quantity_loan_disburse;
		var quantity_available_only_delta =
			(req.body.items[i].quantity_loan_return - req.body.items[i].quantity_outstanding_loan);
		request.items[i].item.quantity += quantity_and_available_delta + quantity_only_delta;
		request.items[i].item.quantity_available +=
			(quantity_and_available_delta + quantity_available_only_delta);
		request.items[i].item.save(function (err, success) {
			console.log("Err: " + err);
			console.log("Suc: " + success);
		});
	}
}

function refreshRequestQuantities(req) {
	//TODO: extract once it's confirmed working
	for (var i = 0; i < req.body.items.length; i++) {
		var item = req.body.items[i];
		console.log("refresh");
		console.log(item.quantity_loan_backfill);
		req.body.items[i].quantity_requested -= (
			item.quantity_outstanding_disburse + item.quantity_outstanding_loan
			+ item.quantity_outstanding_deny + item.quantity_outstanding_backfill + item.quantity_cancel
		);
		req.body.items[i].quantity_disburse += (
			item.quantity_outstanding_disburse + item.quantity_loan_disburse
		);
		req.body.items[i].quantity_loan += (
			item.quantity_outstanding_loan - (item.quantity_loan_return
			+ item.quantity_loan_disburse + item.quantity_loan_backfill)
		);
		req.body.items[i].quantity_deny += item.quantity_outstanding_deny;
		req.body.items[i].quantity_return += item.quantity_loan_return;
		req.body.items[i].quantity_backfill += (
			item.quantity_outstanding_backfill + item.quantity_loan_backfill
		);

		req.body.items[i].quantity_cancel = 0;

		req.body.items[i].quantity_outstanding_disburse = 0;
		req.body.items[i].quantity_outstanding_loan = 0;
		req.body.items[i].quantity_outstanding_deny = 0;
		req.body.items[i].quantity_outstanding_backfill = 0;

		req.body.items[i].quantity_loan_disburse = 0;
		req.body.items[i].quantity_loan_return = 0;
		req.body.items[i].quantity_loan_backfill = 0;
	}
	return req.body.items;
}

function generateBackfills(request, newItems) {
	var newBackfills = [];
	var loanBackfills = [];

	for (var i = 0; i < request.items.length; i++) {
		if (newItems[i].quantity_outstanding_backfill > 0) {
			var newBackfill = {
				item: request.items[i].item,
				quantity: newItems[i].quantity_outstanding_backfill,
				origin: 'outstanding'
			};
			newBackfills.push(newBackfill);
		}

		if (newItems[i].quantity_loan_backfill > 0) {
			var newLoanBackfill = {
				item: request.items[i].item,
				quantity: newItems[i].quantity_loan_backfill,
				origin: 'loan'
			}
			loanBackfills.push(newLoanBackfill);
			//decrementQuantityAvailable(request.items[i], newItems[i].quantity_loan_backfill);
		}
	}

	if (newBackfills.length > 0) generateNewBackfill(request, newBackfills);
	if (loanBackfills.length > 0) generateNewBackfill(request, loanBackfills);
}

function generateNewBackfill(request, backfillItems) {
	console.log("backfill");
	console.log(backfillItems);
	var backfillOrigin = backfillItems[0].origin;
	var backfillStatus = backfillOrigin === 'loan' ? 'requested' : 'inTransit';
	Backfill.create({
		 items: backfillItems,
		 request: request._id,
		 origin: backfillOrigin,
		 status: backfillStatus
	 }, function (err, bf) {
		if (err) {
			console.log("BF ERR: " + err);
		}
		else {
			console.log("BF SUCC: " + bf);
		}
	});
}

function saveBackfills(request, req) {
	for (let i = 0; i < req.body.backfills.length; i++) {
		// Generate mape of backfills id, quantity (+/-)
		Backfill.findOne({_id: req.body.backfills[i]._id})
		.populate('items.item')
		.exec((err, backfill) => {
			for (var j = 0; j < backfill.items.length; j++){
				// returns -1, 1, 0 based on state transistion
				var backfillSignMultiplier = determineBackfillSignMultiplier(backfill, req.body.backfills[i].status);
				console.log(backfillSignMultiplier);
				// TODO: inTransit -> failed
				if (backfillSignMultiplier == 2 || backfillSignMultiplier == -2) {
					handleFailCondition(request, backfill, backfillSignMultiplier);
				}
				else {
					handleCommonCondition(backfill, backfillSignMultiplier);
				}
			}
			backfill.status = req.body.backfills[i].status;
			backfill.save(function(err, success) {
				console.log("BFE: " + err);
				console.log("BFS: " + success);
			});
		});
	}
	//return mapping
}

function handleFailCondition(request, backfill, backfillSignMultiplier) {
	console.log("Failed from loan");
	Request.findOne({_id: request._id})
	.exec(function (err, foundRequest) {
		for (let j = 0; j < backfill.items.length; j++) {
			for (let k = 0; k < foundRequest.items.length; k++) {
				if (backfill.items[j].item.name === foundRequest.items[k].item.name) {
					foundRequest.items[k].quantity_loan += backfill.items[j].quantity;
				}
			}
		}
		if (backfillSignMultiplier == -2) foundRequest.notes.push("[Autogen] new loan added from failed backfill at " + new Date().toISOString());
		foundRequest.save((err, success) => {
			console.log("FAILED FROM LOAN ERROR: " + err);
			console.log("FAILED FROM LOAN SUCC: " + success);
		});
	});
}

function handleCommonCondition(backfill, backfillSignMultiplier) {
	console.log("Backfill didn't fail");
	for (var p = 0; p < backfill.items.length; p++) {
		var quantityAvailableDelta = backfillSignMultiplier * backfill.items[p].quantity;
		backfill.items[p].item.quantity_available += quantityAvailableDelta;
		backfill.items[p].item.save(function(err, success) {
			if (err) console.log("BF QA err: " + err);
			if (success) console.log("BF QA succ: " + success);
		});
	}
}

function determineBackfillSignMultiplier(backfill, newStatus) {
	console.log("determineSign");
	console.log(backfill);
	console.log(newStatus);
	if (backfill.status === 'requested' && newStatus === 'inTransit' && backfill.origin === 'outstanding') {
		return -1;
	}
	else if (backfill.status === 'inTransit' && newStatus === 'fulfilled') {
		return 1;
	}
	else if (backfill.status === 'requested' && newStatus === 'denied'){
		return 0;
	}
	else if (backfill.status === 'requested' && newStatus === 'inTransit' && backfill.origin === 'loan') {
		return 0;
	}
	else if (backfill.status === 'inTransit' && newStatus === 'failed' && backfill.origin === 'loan'){
		// TODO: handle inTransit -> failed case
		return 2;
	}
	else if (backfill.status === 'inTransit' && newStatus === 'failed' && backfill.origin === 'outstanding'){
		// TODO: handle inTransit -> failed case
		return -2;
	}
	else {
		console.log("BROKEN DETERMINATION");
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
