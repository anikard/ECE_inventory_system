/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Order = mongoose.model('Request');
var Customer = mongoose.model('User');
var Product = mongoose.model('Item');
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
 			});
 		},
 	}
})();
