var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var _ = require('lodash');
var Item = mongoose.model('Item');
var Field = mongoose.model('Field');
var Asset = mongoose.model('Asset');
var Log = mongoose.model('Log');
var Tag = mongoose.model('Tag');
var util = require('./util.js');
var async = require("async");

module.exports = (app) => {

  app.get('/api/item/addAsset1', util.requirePrivileged, function(req, res, next) {
    Item.findOne({}, (err,item)=>{
      let asset = new Asset({
        item: item,

      });
      asset.assetTag = asset._id;
      asset.save(function(err){
          if(err) return next(err);
          res.status(200).send(asset); 
        })
    })
    
  });

  app.get('/api/item/addAsset2', util.requirePrivileged, function(req, res, next) {
    Item.findOne({}, (err,item)=>{
      let asset = new Asset({
        item: item,
        assetTag: "12345",
      });
      asset.save(function(err){
          if(err) return next(err);
          res.status(200).send(asset); 
        })
    })
    
  });

  app.get('/api/item/assets', util.requirePrivileged, function(req, res, next) {
    Asset.find({}, (err,results)=>{
      res.status(200).send(results);
    })
    
  });

  app.get('/api/item/assetsR', util.requirePrivileged, function(req, res, next) {
    Asset.find({}, (err,results)=>{
      results.forEach(e=>e.remove());
      res.status(200).send(results);
    })
    
  });

}
