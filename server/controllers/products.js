/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Product = mongoose.model('Item');

module.exports = (function() {
 	return {
 		displayProducts: function(req, res) {
 			res.redirect('products/products.html');
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
			var product = new Product({
        name: req.body.name,
				description: req.body.description,
				quantity: req.body.num_left,
				image: req.body.image,
        model: req.body.model,
        location: req.body.location,
        tags: req.body.tags,
      });

			product.save(function(err){
			    if(err){
				    console.log("Error");
			    } else {
				    console.log("Successfully added a product!");
				    res.end(); //  end the function to return
			    }
			})
		},

    delete: function(req, res) {
      Product.findByIdAndUpdate(
        req.body._id,
        { new: true },
        function (err, product) {
          if (err) console.log("Delete Product Error");
          res.end();
        }
      );
    },

    update: function(req, res) {
      Product.findByIdAndUpdate(
        req.body._id,
        {$set: {
          name: req.body.name,
          description: req.body.descrition,
          quantity: req.body.num_left,
          model: req.body.model,
          location: req.body.location,
          //TODO: tags
          //TODO: image_url
        }},
        { new: true },
        function (err, product) {
          if (err) console.log("Update Product Error");
          res.json(product);
        });
    }

 	}
})();
