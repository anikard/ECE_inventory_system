/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var User = mongoose.model('User');
var Item = mongoose.model('Item');


module.exports = (function() {
 	return {
 		displayOrders: function(req, res) {
 			res.redirect('orders/orders.html');
 		},
	  	show: function(req, res) {
	     	res.json(this.findAllRequests());
	 	},

	   	add: function(req, res) {
	   		var user = this.findUserById(req.body.userId);
	   		console.log("Detail:");
	   		console.log(user._id);
	   		if (!user) {
	   			res.status(500).send({ error: "No such user" });
	   		}

	        var request = new Request({
	        	userId: user._id,
	        	quantity: req.body.quantity | 0,
	        	itemId: req.body.itemId | "",
	        	reason: req.body.reason | "",
	        	note: req.body.note | "",
				status: req.body.status | "open",
	        });

	        request.save(function(err){
	        	if (err) {
	        		res.status(500).send({ error: err });
	        	} else {
	        		console.log("Successfully added an order!");
	        		res.status(200).send("Successfully added an order!");
	        	}
	        });
		},

		close: function(req, res) {
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
		},

		delete: function(req, res) {
			Request.remove({ _id: req.body._id}, 
				function (err, request) {
					if (err) {
						res.status(500).send({ error: err });
					} else {
						console.log("Successfully added an order!");
	        			res.status(200).send("Successfully added an order!");
					}
					res.end();
				}
			);
		},

		update: function(req, res) {
			var request = this.findRequestsById(req.body._id);
			if (!request)
				res.status(500).send({ error: "Cannot find order" });

			var item = this.findItemById(request.itemId);
			if (!item)
				res.status(500).send({ error: "Cannot find product in the order" });

			if (request.status === "open" && req.body.status === "approved") {
				if (item.quantity && item.quantity >= request.quantity) {
					item.quantity-=request.quantity;
					request.note = req.body.note | request.note;
					request.status = "approved";
					request.save(function (err) {
						if(!err) {
							item.save(function (err) {
								res.json(request);
							});
						}
					});

				} else {
					res.status(500).send({ error: "quantity requested exceeds st" });
				}
			} else {
				request.note = req.body.note | request.note;
				request.status = req.body.status | request.status;
				request.quantity = req.body.quantity | request.quantity;
				request.reason = req.body.reason | request.reason;
				request.itemId = req.body.itemId | request.itemId;
				request.userId = req.body.userId | request.userId;
				request.save(function (err){
					if(!err){
						res.json(request);
					}
				})
			}
		},

		findRequestsById: function(id) {
			Request.findOne({ '_id': id }, function (err, request) {
			  if (err) return null;
			  return request;
			})
		},

		findAllRequests: function() {
			Request.find({})
	     	.populate('item user')
	     	.exec(function(err, results) {
		       	if(err) {
		         	console.log(err);
		         	return null;
		       	} else {
		       		results.forEach(function(e){
		       			//e.customer_name = e.user.name;
		       		});
		         	return results;
		       	}
	   		});
		},

		findRequestsByUser: function(name) {
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
		},

		findRequestsByItem: function(item) {
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
		},

		findUserByName: function(name) {
			User.findOne({ 'name': name }, function (err, user) {
				if(err) {
		         	console.log(err);
		         	return null;
		       	} else {
		         	return user;
		       	}
			})
		},

		findUserById: function(userId) {
			User.findOne({ '_id': userId }, function (err, user) {
				if(err) {
		         	console.log(err);
		         	return null;
		       	} else {
		       		console.log("Success!");
		       		console.log(user._id);
		       		console.log(user.name);
		         	return user;
		       	}
			})
		},


		findItemById: function(id) {
			Item.findOne({ '_id': id }, function (err, item) {
				if(err) {
		         	console.log(err);
		         	return null;
		       	} else {
		         	return item;
		       	}
			})
		},
 	}
})();

