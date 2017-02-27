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
  app.use('/api/user/update', util.requireLogin);
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
    let fields = 'name username netId email status active date';
    if (req.user.status === "admin") fields = `${fields} apiKey`;
  	User.findOne({ '_id': req.params.id },fields, function (err, user) {
  		if(err) {
  			res.status(500).send({ error: err });
  		} else {
  			res.json(user);
  		}
  	});
  });

  app.get('/api/user/show', function(req, res, next){
    let fields = 'name username netId email status active date';
    if (req.user.status === "admin") fields = `${fields} apiKey`;
  	User.find({}, fields, function(err, results) {
  		if(err) {
  			res.status(500).send({ error: err });
  		} else {
  			res.json(results);
  		}
  	});
  });

  app.post('/api/user/add', function(req, res, next){
    if (!req.body.name || !req.body.username || !req.body.password)
      return res.status(400).send("Missing name, username or password");
    let info = _.pick(req.body,['name','username','netId','email','status','active']);
    info.date = new Date();
    info.active = info.active || true;
    info.status = info.status || 'user';
  	var user = new User(info);
    user.setPassword(req.body.password);
  	user.save(function(err){
  		if(err){
  			res.status(500).send({ error: err });
  		} else {
  			res.status(200).send("Successfully added a user!");
  		}  	});
  });

  app.post('/api/user/update', function(req, res, next){
    req.body._id = req.body._id || req.body.user || req.user._id;
    if (req.body._id != req.user._id && req.user.status!="admin" && req.user.status!="manager")
      return res.status(403).send("Unauthorized");
    info = _.pick(req.body,['name','username','netId','email','active']);
    if ((req.user.status==="admin" || req.user.status==="manager") && req.body.status)
      info.status = req.body.status;
    User.findOne({ '_id': req.body._id }, function (err, user) {
      if (err) return res.status(500).send({ error: err });
      _.assign(user, info);
      if (req.body.password) user.setPassword(req.body.password);
      user.save(function(err){
        if(err){
          res.status(500).send({ error: err });
        } else {
          res.status(200).send("Successfully updated a user!");
        }
      });
    });
  	
  });

  app.post('/api/user/del', function(req, res, next){
    req.body._id = req.body._id || req.body.user;
    if (!req.body._id) return res.status(400).send("Missing _id or user");
    if (req.body._id === req.user._id) return res.status(400).send("Cannot delete yourself");
  	User.findOneAndRemove({'_id': req.body._id}, 
  		function(err){
  			if(err){
  				res.status(500).send({ error: err });
  			} else {
  				res.status(200).send("Successfully removed a user!");
  			}
  		});    
  });
}
