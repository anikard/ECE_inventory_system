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

	  		Customer.find({}).populate('orders').exec(function(err, post){
			    if(err){
			      console.log("Error");
			    } else{
			    }
			});


	     	Order.find({}, function(err, results) {
		       	if(err) {
		         	console.log(err);
		       	} else {
		         	res.json(results);
		       	}
	   		})
	 	},
	   	add: function(req, res) {
	   		Customer.findOne({name: req.body.customer_name}, function(err, thisCustomer){
		        

		        var order = new Order({
		        	quantity: req.body.quantity,
		        	userId: thisCustomer._id,
		        	itemId: req.body.product,
		        });

		        order.save(function(err){
		          thisCustomer.save(function(err){
		            if(err) {
		              console.log('Error');
		            } else {
		                console.log("Successfully added an order!");

		                // decrement number of products in stock
				  //       Product.update(
				  //       	{ name: req.body.product },
						// 	{ $inc: { num_left: -req.body.quantity } },
						// 	function(err, numberAffected, rawResponse) {
		   	// 						console.log('error', err);
		   	// 						}
						// )

				    	res.end(); //  end the function to return
		            }
		          });
		        });

		        
		    });

		},

		delete: function(req, res) {
			// remove order from array in customer
			Customer.update(
					{_id: req.body._customer},
                   	{ $pull: { orders: req.body._id} }
                 );

			Order.findOneAndRemove({_id: req.body._id}, 
				function(err){
				 if(err){
				    console.log("Error");
			    } else {
				    console.log("Successfully removed an order!");

					// increment number of products in stock
				  //       Product.update(
				  //       	{ name: req.body.product },
						// 	{ $inc: { num_left: req.body.quantity } },
						// 	function(err, numberAffected, rawResponse) {
		   	// 						console.log('error', err);
		   	// 						}
						// )

				    res.end(); //  end the function to return
			    }

				});
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
