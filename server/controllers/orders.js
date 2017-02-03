/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Order = mongoose.model('Request');
var Customer = mongoose.model('User');
var Product = mongoose.model('Item');


module.exports = (function() {
 	return {
 		displayOrders: function(req, res) {
 			res.redirect('orders/orders.html');
 		},
	  	show: function(req, res) {
	     	Order.find({})
	     	.populate('itemId')
	     	.populate('userId')
	     	.exec(function(err, results) {
		       	if(err) {
		         	console.log(err);
		       	} else {
		         	res.json(results);
		       	}
	   		});
	 	},

	   	add: function(req, res) {
	   		Customer.findOne({name: req.body.customer_name}, function(err, user){
          console.log(user);
		        var order = new Order({
		        	quantity: req.body.quantity,
		        	userId: user._id,
		        	itemId: req.body.product,
		        	note: "",
 					status: "open",
		        });

		        order.save(function(err){
		        	if (!err) {
		        		console.log("Successfully added an order!");
		        	}
		        	res.end();
		        });
		    });
		},

		delete: function(req, res) {
			// Customer.update(
			// 		{_id: req.body._customer},
   //                 	{ $pull: { orders: req.body._id} }
   //               );
			Order.findByIdAndUpdate(
				req.body._id,
				{ $set: {
					status: "closed",
				}},
				{ new: true },
				function (err, order) {
					if (err) console.log("Error");
					res.end();
				}
			);
		},

		update: function(req, res) {
			Order.findByIdAndUpdate(
				req.body._id,
				{ $set: {
					status: req.body.status,
					note: req.body.note,
				}},
				{ new: true },
				function (err, order) {
					if (err) console.log("Error");
					res.json(order);
				});
		},

 	}
})();
