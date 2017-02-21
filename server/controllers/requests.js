var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var User = mongoose.model('User');
var Item = mongoose.model('Item');

module.exports = (app) => {
	app.get('/api/v1/request/show', function(req, res, next) {
	  show(req, res, next);
	});

	app.post('/api/v1/request/add', function(req, res, next) {
	  add(req, res, next);
	});

	app.post('/api/v1/request/close', function(req, res, next) {
	  close(req, res, next);
	});

	app.post('/api/v1/request/del', function(req, res, next) {
	  del(req, res, next);
	});

	app.post('/api/v1/request/update', function(req, res, next) {
	  update(req, res, next);
	});
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
	if (!req.user || !req.user.status)
		return res.status(401);
	if (req.user.status === "admin") {
		Request.find({})
	 	.populate('item user')
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
		return;
	}
	Request.find({user:req.user._id})
 	.populate('item user')
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
	if(!req.body.quantity) {
		res.status(500).send({ error: "Missing quantity field" });
		return;
	}
	if(!req.body.userId) {
		res.status(500).send({ error: "Missing userId field" });
		return;
	}
	if(!req.body.itemId) {
		res.status(500).send({ error: "Missing itemId field" });
		return;
	}
	User.findOne({ '_id': req.body.userId }, function (err, user) {
		if(err) {
         	res.status(500).send({ error: "No such user" });
       	} else {
	        var request = new Request({
	        	user: user._id,
	        	quantity: req.body.quantity || 0,
	        	item: req.body.itemId || "",
	        	reason: req.body.reason || "",
	        	note: req.body.note || "",
				status: req.body.status || "open",
	        });
	        request.save(function(err){
	        	if (err) {
	        		res.status(500).send({ error: err });
	        	} else {
	        		res.status(200).send("Successfully added an order!");
	        	}
	        });
       	}
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

