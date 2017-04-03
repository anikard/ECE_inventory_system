var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var _ = require('lodash');
var Item = mongoose.model('Item');
var Field = mongoose.model('Field');
var Asset = mongoose.model('Asset');
var Log = mongoose.model('Log');
var Tag = mongoose.model('Tag');
var Backfill = mongoose.model('Backfill');
var util = require('./util.js');
var async = require("async");

module.exports = {
    
    send: null,

    routes: function(app) {
      app.get('/api/backfill/show', util.requireLogin, show);
      app.post('/api/backfill/add', util.requireLogin, add);

    }
}

function show (req, res, next) {
  let query = (req.user.status === "admin" || req.user.status === "manager") ? {} : { user : req.user._id };
  _.assign(query, _.pick(req.query, ['status']));
  Backfill.find(query)
  .sort('-date')
  .exec(function(err, results) {
    if (err) return next(err);
    res.status(200).json(results);
  });
}

function add (req, res, next) {
  let backfill = new Backfill(_.pick(req.body, ['items', 'request']));
  verifyAndSave(backfill, (err, backfill)=>{
    if(err) return next(err);
    res.status(200).json(backfill);
  });
}

function update (req, res, next) {
  Backfill.findOne({_id:req.body._id || req.body.id || req.body.backfill})
  .exec((err, backfill)=>{
    if (err) return next(err);
    if (!backfill) cb({status: 400, message: "Backfill does not exist"});
    _.assign(backfill, _.pick(req.body,['items']));
    verifyAndSave(backfill, (err, backfill)=>{
      if(err) return next(err);
      res.status(200).json(backfill);
    })
  }) 
}

function close (req, res, next) {
  setStatus(req.body._id || req.body.id || req.body.backfill, "closed", (err, backfill)=>{
    if(err) return next(err);
    res.status(200).json(backfill);
  })
}

function approve (req, res, next) {
  setStatus(req.body._id || req.body.id || req.body.backfill, "inTransit", (err, backfill)=>{
    if(err) return next(err);
    res.status(200).json(backfill);
  })
}

function deny (req, res, next) {
  setStatus(req.body._id || req.body.id || req.body.backfill, "denied", (err, backfill)=>{
    if(err) return next(err);
    res.status(200).json(backfill);
  })
}

function done (req, res, next) {
  setStatus(req.body._id || req.body.id || req.body.backfill, "fulfilled", (err, backfill)=>{
    if(err) return next(err);
    res.status(200).json(backfill);
  })
}

function verifyAndSave(backfill, cb) {
  backfill.populate('items.item request', (err, backfill)=>{
    if (err) return cb(err);
    if (!backfill.request.id) return cb({status: 400, message: "Request does not exist"});
    for (let i = 0; i < backfill.items.length; i++) {
      if(!backfill.items[i].item.id) return cb({status: 400, message: "Item does not exist"});
    }
    backfill.save((err)=>{
      if(err) return cb(err);
      cb(null, backfill);
    });
  })
}

function setStatus(id, status, cb) {
  Backfill.findOne({_id:id})
  .exec((err, backfill)=>{
    if (err) return cb(err);
    if (!backfill) cb({status: 400, message: "Backfill does not exist"});
    backfill.status = status;
    backfill.save((err)=>{
      if(err) return cb(err);
      cb(null, backfill);
    });

  })
}

