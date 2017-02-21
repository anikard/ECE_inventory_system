var mongoose = require('mongoose');
var Field = mongoose.model('Field');
var _ = require('lodash');

module.exports = (app) => {
	app.get('/api/customField/show', function(req, res, next) {
	  show(req, res, next);
	});

	app.post('/api/customField/add', function(req, res, next) {
	  add(req, res, next);
	});

	app.post('/api/customField/del', function(req, res, next) {
	  del(req, res, next);
	});

	app.post('/api/customField/update', function(req, res, next) {
	  update(req, res, next);
	});
}

function show(req, res) {
	Field.find({})
 	.exec(function(err, results) {
       	if(err) {
         	res.status(500).send({ error: err});
       	} else {
         	res.json(results);
       	}
	});
}

function add(req, res) {
	if (! req.body.name) return res.status(400).send({ error: "Missing name" });
	Field.findOne({ name: req.body.name }, function (err, field) {
      if (err) return res.status(500).send({ error: err });
      if (field) return res.status(405).send({ error: "Field already exist" });
      field = new Field(_.pick(req.body, ['name','type','access','req','default']));
      field.save(function(err){
          if(err){
            res.status(500).send({ error: err })
          } else {
            res.status(200).send("success"); //  end the function to return
          }
      });
    });
}

function del(req, res) {
	if (! req.body.name) return res.status(400).send({ error: "Missing name" });
	Field.remove({ name: req.body.name},
      function (err, request) {
        if (err) {
          res.status(500).send({ error: err });
        } else {
          res.status(200).send("success");
        }
        res.end();
      }
    );
}

function update(req, res) {
	if (! req.body.name) return res.status(400).send({ error: "Missing name" });
	Field.update({ name: req.body.name }, {
		$set: _.pick(req.body, ['name','type','access','req','default'])
	}, function(err, field){
      if(err){
        res.status(500).send({ error: err })
      } else {
        res.status(200).json(field);
      }
    });
}
