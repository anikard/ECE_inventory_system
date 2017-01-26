/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Order = mongoose.model('Order');
var Customer = mongoose.model('Customer');
var Product = mongoose.model('Product');


module.exports = (function() {
 	return { 
 		show: function(req, res) {
 			res.redirect('dashboard.html');
 		}

 	}
})();