/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Item = mongoose.model('Item');

module.exports = (function() {
 	return {
 		displayProducts: function(req, res) {
 			res.redirect('products/products.html');
 		},
	  	show: function(req, res) {
	     	Item.find({}, function(err, results) {
		       	if(err) {
		         	console.log(err);
		       	} else {
		         	res.json(results);
		       	}
	   		})
	 	},
	 	add: function(req, res) {
      Item.findOne({ 'name': req.body.name }, function (err, item) {
        if (err) {
          res.status(500).send({ error: err });
          return;
        }
        if (item) {
          res.status(405).send({ error: "Item already exist!" });
        } 
        var newItem = new Item({
          name: req.body.name,
          description: req.body.description,
          quantity: req.body.quantity,
          image: req.body.image,
          model: req.body.model,
          location: req.body.location,
          tags: req.body.tags,
        });
        newItem.save(function(err){
            if(err){
              res.status(500).send({ error: err })
            } else {
              res.status(200).end(); //  end the function to return
            }
        });
      });
			
		},

    delete: function(req, res) {
      Item.remove({ _id: req.body._id},
        function (err, request) {
          if (err) {
            res.status(500).send({ error: err });
          } else {
      			res.status(200).send("Successfully deleted a item!");
					}
          res.end();
        }
      );
    },

    update: function(req, res) {
      Item.findByIdAndUpdate(
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
        function (err, item) {
          if (err) console.log("Update item Error");
          res.json(item);
        });
    }

 	}
})();
