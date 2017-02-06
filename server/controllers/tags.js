/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Tag = mongoose.model('Tag');

module.exports = (function() {
 	return {
	  	show: function(req, res) {
  			Tag.find({})
  		 	.exec(function(err, results) {
  		       	if(err) {
  		         	res.status(500).send({ error: err});
  		       	} else {
  		         	res.json(results);
  		       	}
  			});
	 	},

	   	add: function(req, res) {
	   		Tag.findOne({ 'name': req.body.name }, function (err, tag) {
	   			if (err) {
	   				res.status(500).send({ error: err });
	   			} else {
	   				if (tag) {
	   					res.status(500).send({ error: "Tag already exist!" });
	   				} else {
	   					var tag = new Tag({name: req.body.name || ""}); // Modified due to blank name error
              console.log("tag is : " + tag);
	   					tag.save(function(err){
	   						if (err) {
	   							res.status(500).send({ error: err });
	   						} else {
	   							res.status(200).send("Successfully added a tag!");
	   						}
	   					});
	   				}
	   			}
	   		});


		},

		delete: function(req, res) {
			Tag.remove({ name: req.body.name},
				function (err, request) {
					if (err) {
						res.status(500).send({ error: err });
					} else {
	        			res.status(200).send("Successfully deleted a tag!");
					}
					res.end();
				}
			);
		},

 	}
})();
