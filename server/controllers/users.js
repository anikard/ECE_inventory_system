/********************************************************/
/*            CONTROLLER            */
/********************************************************/

var mongoose = require('mongoose');
var User = mongoose.model('User');
var util = require('./util.js');
var _ = require('lodash');

module.exports = (app) => {
  app.use('/api/user', util.requireLogin);
  app.use('/api/user/apiKey/get', util.requireLogin);
  app.use('/api/user/apiKey/revoke', util.requireLogin);
  app.use('/api/user/:id/info', util.requirePrivileged);
  app.use('/api/user/show', util.requirePrivileged); 
  app.use('/api/user/add', util.requirePrivileged);
  app.use('/api/user/update', util.requirePrivileged);
  app.use('/api/user/del', util.requirePrivileged);

  // Get current user info 
  app.get('/api/user', function(req, res, next){
  	res.status(200).json(_.pick(req.user, ['username','name','netId','email','status','active','apiKey']));
  });

  app.get('/api/user/apiKey/get', function(req, res, next){
    let key = req.user.generateApiKey();
    req.user.save((err)=>{
      if (err) res.status(500).send({ error: err });
      else res.status(200).json(key);
    });
  });

  app.get('/api/user/apiKey/revoke', function(req, res, next){
    req.user.revokeApiKey();
    req.user.save((err)=>{
      if (err) res.status(500).send({ error: err });
      else res.status(200).json("success");
    });
  });

  // Get user info 
  app.get('/api/user/:id/info', function(req, res, next){
  	User.findOne({ '_id': req.params.id }, function (err, user) {
  		if(err) {
  			res.status(500).send({ error: err });
  		} else {
  			res.json(user);
  		}
  	});
  });

  app.get('/api/user/show', function(req, res, next){
  	User.find({}, function(err, results) {
  		if(err) {
  			res.status(500).send({ error: err });
  		} else {
  			res.json(results);
  		}
  	});
  });

  app.post('/api/user/add', function(req, res, next){
  	var user = new User({name: req.body.name, date: new Date(), active: 'true'});
  	user.save(function(err){
  		if(err){
  			res.status(500).send({ error: err });
  		} else {
  			res.status(200).send("Successfully updated a user!");
  		}  	});
  });

  app.post('/api/user/update', function(req, res, next){
  	return res.status(405);
  	var user = new User({name: req.body.name, date: new Date(), active: 'true'});
  	user.save(function(err){
  		if(err){
  			res.status(500).send({ error: err });
  		} else {
  			res.status(200).send("Successfully updated a user!");
  		}
  	});
  });

  app.post('/api/user/del', function(req, res, next){
  	User.findOneAndRemove({'_id': req.body.user}, 
  		function(err){
  			if(err){
  				res.status(500).send({ error: err });
  			} else {
  				res.status(200).send("Successfully removed a user!");
  			}
  		});    
  });
}
