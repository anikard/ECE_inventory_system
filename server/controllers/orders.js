/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var User = mongoose.model('User');
var Item = mongoose.model('Item');

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


module.exports = (function() {
 	return {
 		displayOrders: function(req, res) {
 			res.redirect('orders/orders.html');
 		},
	  	show: function(req, res) {
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
	 	},

	   	add: function(req, res) {
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
         	        console.log(request);
         	        request.save(function(err){
         	        	if (err) {
         	        		res.status(500).send({ error: err });
         	        	} else {
         	        		console.log("Successfully added an order!");
         	        		res.status(200).send("Successfully added an order!");
         	        	}
         	        });
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
						console.log("Successfully deleted an order!");
	        			res.status(200).send("Successfully deleted an order!");
					}

					res.end();
				}
			);
		},

		update: function(req, res) {
			Request.findOne({ '_id': req.body._id }, function (err, request) {
				if (err) {
					res.status(500).send({ error: "Cannot find order" });
				} else {
					Item.findOne({ '_id': request.item }, function (err, item) {
						if(err) {
				         	res.status(500).send({ error: "Cannot find item in the order" });
				       	} else {
				         	if (request.status === "open" && req.body.status === "approved") {
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
				         			res.status(500).send({ error: "quantity requested exceeds stock limit" });
				         		}
				         	} else {
				         		console.log(request);
				         		request.note = req.body.note || request.note;
				         		request.status = req.body.status || request.status;
				         		request.quantity = req.body.quantity || request.quantity;
				         		request.reason = req.body.reason || request.reason;
				         		request.item = req.body.itemId || request.item;
				         		request.user = req.body.userId || request.user;
				         		request.save(function (err){
				         			if(!err){
				         				res.json(request);
				         			}
				         		})
				         	}
				       	}
					});
				}
			});

			
		},

		
 	}
})();

