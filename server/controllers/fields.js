var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Field = mongoose.model('Field');
var _ = require('lodash');
var util = require('./util.js');

module.exports = (app) => {

	app.get('/api/customField/show', util.requireLogin, show);
	app.post('/api/customField/add', util.requirePrivileged, add);
	app.post('/api/customField/del', util.requirePrivileged, del);
	app.post('/api/customField/update', util.requirePrivileged, update);
}

function show(req, res) {
  // We don't limit on fields, since there should not be so many fields that pagination is necessary
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
      field = new Field(_.pick(req.body, ['name','type', 'perAsset', 'access','req','default']));
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
	Field.findOneAndUpdate({name: req.body.name}, {
		$set: _.pick(req.body, ['type','access','perAsset','req','default'])
	}, function(err, field){
      if(err){
        res.status(500).send({ error: err })
      } else {
        res.status(200).json(field);
      }
    });
}
