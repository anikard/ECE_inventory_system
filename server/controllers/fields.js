var mongoose = require('mongoose');
var Field = mongoose.model('Field');

module.exports = (app) => {
	app.get('/api/v2/customField/show', function(req, res, next) {
	  show(req, res, next);
	});

	app.post('/api/v2/customField/add', function(req, res, next) {
	  add(req, res, next);
	});

	app.post('/api/v2/customField/del', function(req, res, next) {
	  del(req, res, next);
	});

	app.post('/api/v2/customField/update', function(req, res, next) {
	  update(req, res, next);
	});
}

function show = (req, res) => {
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}

function add = (req, res) => {
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}

function del = (req, res) => {
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}

function update = (req, res) => {
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}



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
