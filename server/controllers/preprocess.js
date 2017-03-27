var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Field = mongoose.model('Field');
var User = mongoose.model('User');
var _ = require('lodash');
var util = require('./util.js');

function addField(name) {
	Field.findOne({ name: name }, function (err, field) {
	  if (err) return console.log(err);
	  if (field) return;
	  field = new Field({
	  	name: name,
	  });
	  field.save(function(err){
	      if(err) return console.log(err);
	  });
	});
}

User.findOne({username:'admin'}, (err, user) => {
	if(err) return console.log(err);
	if(user) return;
	addField('Restock Info');
	addField('Location');
});