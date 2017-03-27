var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Field = mongoose.model('Field');
var _ = require('lodash');
var util = require('./util.js');

function addField(name) {
	Field.findOne({ name: name }, function (err, field) {
	  if (err) return console.log(err);
	  if (field) return;
	  field = new Field({
	  	name: name,
	  	type: 'short',
	  	access: '',
	  });
	  field.save(function(err){
	      if(err) return console.log(err);
	  });
	});
}

addField('Restock Info');
addField('Location');