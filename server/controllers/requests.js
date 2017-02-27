var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var User = mongoose.model('User');
var Item = mongoose.model('Item');
var Log = mongoose.model('Log');
var util = require('./util.js');

module.exports = (app) => {

	app.get('/api/request/show', util.requireLogin, show);
	app.post('/api/request/add', util.requireLogin, add);
	app.post('/api/request/close', util.requirePrivileged, close);
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
	.limit(req.query.limit || 20)
 	.populate('item.item user')
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
	let id = (req.user.status === "admin" || req.user.status === "manager") ? 
				(req.body.user || req.body.userId || req.body._id) : undefined;
	id = id || req.user._id;
	Cart.findOne({user: id}, function(err, cart) {
		if (err) 
			return res.status(500).send({ error: err });
		if (!cart || cart.items.length === 0) 
			return res.status(400).send({ error: "Empty cart" });
		let request = new Request({
        	user: id,
        	items: cart.items,
        	reason: req.body.reason || "",
        	note: req.body.note || "",
			status: req.body.status || "open",
        });
        request.save((err,request) => {
        	if (err) 
				return res.status(500).send({ error: err });
			cart.items = [];
			cart.save((err)=>{
				if (err) 
					return res.status(500).send({ error: err });
	    		let arr = []
	    		request.items.forEach(i=>arr.push(i.item));
	    		let log = new Log({
					init_user: id,
					item: arr,
	 				event: "request",
	 				rec_user: id,
				});
				log.save((err)=>{
					if (err) 
						return res.status(500).send({ error: err });
					return res.status(200).json(request);
				});
			});
    		
			
        })
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
				console.log("Successfully deleted an order!");
    			res.status(200).send("Successfully deleted an order!");
			}

			res.end();
		}
	);
}

function update (req, res) {
	Request.findOne({ '_id': req.body._id }, function (err, request) {
		if (err) return res.status(500).send({ error: err});

		Item.findOne({ '_id': request.item }, function (err, item) {
			if(err) return res.status(400).send({ error: err});

			if (request.status === "open" && req.body.status === "approved") {
				if (req.user.status != "admin" || req.user.status != "manager") return res.status(401).send({ error: "Unauthorized operation"});
				if (item.quantity && item.quantity >= request.quantity) {
					item.quantity-=request.quantity;
					request.note = req.body.note || request.note;
					request.status = "approved";
					request.save(function (err) {
						if(!err) {
							item.save(function (err) {
								res.json(request);
							});
						}
					});

				} else {
					res.status(400).send({ error: "quantity requested exceeds stock limit" });
				}
			} else {
				request.note = req.body.note || request.note;
				request.status = req.body.status || request.status;
				request.quantity = req.body.quantity || request.quantity;
				request.reason = req.body.reason || request.reason;
				request.item = (req.body.item && req.body.item._id) || request.item;
				request.user = (req.body.user && req.body.user._id) || request.user;
				request.save(function (err){
					if(!err){
						res.status(200).json(request);
					}
				})
			}
		});
	});
}

