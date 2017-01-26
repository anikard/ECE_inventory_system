/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Product = mongoose.model('Product');

module.exports = (function() {
 	return { 
 		displayProducts: function(req, res) {
 			res.redirect('products.html');
 		},
	  	show: function(req, res) {
	     	Product.find({}, function(err, results) {
		       	if(err) {
		         	console.log(err);
		       	} else {
		         	res.json(results);
		       	}
	   		})
	 	},
	 	add: function(req, res) {
			var product = new Product({name: req.body.name, 
				description: req.body.description,
				num_left: req.body.num_left,
				image_url: req.body.image_url});

			product.save(function(err){
			    if(err){
				    console.log("Error");
			    } else {
				    console.log("Successfully added a product!");
				    res.end(); //  end the function to return
			    }
			})
		}
	   	
 	}
})();