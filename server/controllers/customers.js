/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Customer = mongoose.model('User');

module.exports = (function() {
 	return { 
 		displayCustomers: function(req, res) {
 			res.redirect('customers.html');
 		},
 		redirectDashboard: function(req, res) {
 			res.redirect('dashboard.html');
 		},
 		deactivate: function(req, res) {
 			Customer.update(
				{},
				{active: 'false'},
				{multi: true},
				function(err, numberAffected, rawResponse) {
		   			console.log('error', err);
		   			res.redirect('/');
		   		}
			)
	 	},
 		find_active: function(req, res) {
	     	Customer.find({active: 'true'}, function(err, results) {
		       	if(err) {
		         	console.log(err);
		       	} else {
		         	res.json(results);
		       	}
	   		})
	 	},
	  	show: function(req, res) {
	     	Customer.find({}, function(err, results) {
		       	if(err) {
		         	console.log(err);
		       	} else {
		         	res.json(results);
		       	}
	   		})
	 	},
	   	add: function(req, res) {
			var person = new Customer({name: req.body.name, date: new Date()});
			person.save(function(err){
			    if(err){
				    console.log("Error");
			    } else {
				    console.log("Successfully added a customer!");
				    res.end(); //  end the function to return
			    }
			})
		},

		update: function(req, res) {
			var person = new Customer({name: req.body.name, date: new Date(), active: 'true'});
			person.save(function(err){
			    if(err){
				    console.log("Error");
			    } else {
				    console.log("Successfully added a customer!");
				    res.end(); // *** end the function to return
			    }
			})
			// res.redirect('dashboard.html');
		},

		delete: function(req, res) {
			Customer.findOneAndRemove({name: req.body.name}, 
				function(err){
				 if(err){
				    console.log("Error");
			    } else {
				    console.log("Successfully removed an customer!");
				    res.end(); // *** end the function to return
			    }

				});
		}
 	}
})();