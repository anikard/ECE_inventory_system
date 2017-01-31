/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Order = mongoose.model('Order');
var Customer = mongoose.model('Customer');
var Product = mongoose.model('Product');
var Log = mongoose.model('Log');


module.exports = (function() {
 	return { 
 		show: function(req, res) {
 			res.redirect('dashboard.html');
 		},

 		log: function(req, res) {
 			var log = new Log({
 				userId: req.body._customer,
 				action: req.body.action,
 				note: req.body.note,
 			});
			log.save(function(err){
				if (err) {
					console.log('Error saving log');
				}
				res.end();
 		},

 	}
})();
