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
				quantity: req.body.quantity,
				image: req.body.image,
        model: req.body.model,
        location: req.body.location,
        tags: req.body.tags,
      });

			product.save(function(err){
			    if(err){
            res.status(500).send({ error: err })
				    console.log("Add product Error");
			    } else {
				    console.log("Successfully added a product!");
				    res.end(); //  end the function to return
			    }
			})
		},

    delete: function(req, res) {
      Product.remove({ _id: req.body._id},
        function (err, request) {
          if (err) {
            res.status(500).send({ error: err })
            console.log("Delete Product Error");
          } else {
						console.log("Successfully deleted a product!");
	        			res.status(200).send("Successfully deleted a product!");
					}
          res.end();
        }
      );
    },

    update: function(req, res) {
      Product.findByIdAndUpdate(
        req.body._id,
        {$set: {
          name: req.body.name,
          description: req.body.description,
          quantity: req.body.quantity,
          model: req.body.model,
          location: req.body.location,
          tags: req.body.tags,
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
