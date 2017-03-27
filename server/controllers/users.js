var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var User = mongoose.model('User');
var util = require('./util.js');
var _ = require('lodash');

module.exports = (app) => {
  // Get current user info 
  app.get('/api/user', util.requireLogin, function(req, res, next){
  	res.status(200).json(_.pick(req.user, ['username','name','netId','email','status','active','apiKey']));
  });

  app.get('/api/user/apiKey/get', util.requireLogin, getApiKey);

  app.get('/api/user/apiKey/revoke', util.requireLogin, revokeApiKey);

  // Get user info with id
  app.get('/api/user/:id/info', util.requireLevel(['admin']), getUser);

  // Show a list of all users
  app.get('/api/user/show', util.requireLevel(['admin','manager']), show);

  app.post('/api/user/add', util.requireLevel(['admin']), add);

  app.post('/api/user/update', util.requireLevel(['admin']), update);

  app.post('/api/user/subscribe', util.requireLevel(['admin','manager']), subscribe);

  app.post('/api/user/del', util.requireLevel(['admin']), del);
}

function getApiKey(req, res, next){
  let key = req.user.generateApiKey();
  req.user.save((err)=>{
    if (err) res.status(500).send({ error: err });
    else res.status(200).json(key);
  });
}

function revokeApiKey(req, res, next){
  req.user.revokeApiKey();
  req.user.save((err)=>{
    if (err) res.status(500).send({ error: err });
    else res.status(200).json("success");
  });
}

function getUser(req, res, next){
  let fields = 'name username netId email status active date';
  if (req.user.status === "admin") fields = `${fields} apiKey`;
  User.findOne({ '_id': req.params.id },fields, function (err, user) {
    if(err) {
      res.status(500).send({ error: err });
    } else {
      res.json(user);
    }
  });
}

function show(req, res, next){
  let fields = 'name username netId email status active date subscribed';
  if (req.user.status === "admin") fields = `${fields} apiKey`;
  User.find({}, fields, function(err, results) {
    if(err) {
      res.status(500).send({ error: err });
    } else {
      res.json(results);
    }
  });
}

function update(req, res, next){
  req.body._id = req.body._id || req.body.user || req.user._id;
  if (req.body._id != req.user._id && req.user.status!="admin" && req.user.status!="manager")
    return res.status(403).send("Unauthorized");
  info = _.pick(req.body,['name','username','netId','email','active', 'subscribed']);
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
  
}

function subscribe(req, res, next){
  req.body._id = req.body._id || req.body.user || req.user._id;
  if (req.body._id != req.user._id && req.user.status!="admin" && req.user.status!="manager")
    return res.status(403).send("Unauthorized");
  info = _.pick(req.body,['name','username','netId','email','active', 'subscribed']);
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
  
}

function del(req, res, next){
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
}

function add(req, res, next){
  if (!req.body.username || !req.body.password)
    return res.status(400).send("Missing username or password");
  let info = _.pick(req.body,['name','username','netId','email','status','active']);
  info.date = new Date();
  info.name = info.name || info.username;
  info.active = info.active || true;
  info.status = info.status || 'user';
  info.subscribed = info.subscribed || "unsubscribed";
  User.findOne({ 'username': info.username }, function (err, user) {
    if (err) return res.status(500).send({ error: err });
    if (user) return res.status(400).send({ error: "Username exists" });
    user = new User(info);
    user.setPassword(req.body.password);
    user.save(function(err){
      if(err){
        res.status(500).send({ error: err });
      } else {
        res.status(200).send("Successfully added a user!");
      }   
    });
  });
  
}
