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

const allFields = ['name','quantity', 'model','description','tags','image','fields', 'min_quantity', "last_check_date", "isAsset", "assets"];

module.exports = (app) => {
  app.post('/api/asset/add', util.requireLogin, function(req, res, next) {
    let asset = new Asset({
      item: "58df32bfa760bacfd7ed05e2",
    });
    asset.assetTag = asset.id;
    asset.save();
    Item.findOne({_id:"58df32bfa760bacfd7ed05e2"},(err,item)=>{
      console.log(item);
      console.log(item.assets);
      if(item.assets)item.assets.push(asset.id);
      else item.assets = [asset.id];
      item.save((err,item)=>res.status(200).json(item));

    })
  });

  app.get('/api/asset/show', util.requireLogin, function(req, res, next) {
    Item.find({})
    // .limit(parseInt(req.query.limit) || 200)
    .populate('assets')
    .exec((err, results) => {
      if(err) {
        res.status(500).send({ error: err });
      } else {
        res.status(200).json(results);
      }
    })
  });

  app.get('/api/item/show', util.requireLogin, function(req, res, next) {
    Item.find({})
    // .limit(parseInt(req.query.limit) || 200)
    .populate('assets')
    .exec((err, results) => {
      if(err) {
        res.status(500).send({ error: err });
      } else {
        res.status(200).json(results);
      }
    })
  });

  app.post('/api/item/add', util.requirePrivileged, function(req, res, next) {
    if (!req.body.name)
      return res.status(400).send({ error: "Missing itme name" });
    Item.findOne({ 'name': req.body.name }, function (err, item) {
      if (err) next (err);
      if (item) return res.status(405).send({ error: "Item already exists!" });
      item = new Item(_.pick(req.body, allFields));
      item.quantity_available = item.quantity;
      item.save(function(err){
        if(err) return next(err);
        let log = new Log({
          init_user: req.user._id,
          item: [item._id],
          quantity: [item.quantity],
          quantity_available: [item.quantity],
          event: "item created",
          name_list:[item.name]
        });
        log.save(function(err){
          if(err) return next(err);
          res.status(200).send("success"); 
        });
      });
    });
  });

  app.post('/api/item/del', util.requirePrivileged, function(req, res, next) {
    if (! req.body._id && !req.body.item && !req.body.name)
      return res.status(400).send({ error: "Missing _id or name" });
    req.body._id = req.body._id || req.body.item;
    let query = req.body._id ? {_id: req.body._id} : {name: req.body.name};
    Item.remove(query,
      (err, request) => {
        if (err) {
          res.status(500).send({ error: err });
        } else {

          var itemArray = [req.body._id];
          var itemName = [req.body.name];
          let log = new Log({
            init_user: req.user._id,
            item: itemArray,
            event: "item deleted",
            name_list:itemName,
          });
          log.save(function(err){
            if(err) return res.status(500).send({ error: err });
          });
          res.status(200).send("Successfully deleted a item!");
        }
        res.end();
      }
      );
  });

  app.post('/api/item/update', util.requirePrivileged, function(req, res, next) {
    update(req.user, req.body, (err, item)=>{
      if(err) return next(err);
      res.status(200).send(item);
    });
    
  });

  app.post('/api/item/updateAll', util.requirePrivileged, function(req, res, next) {
    if(!req.body || !req.body.length) return res.status(400).send({ error: "Malformatted item array" });
    async.each(req.body, (i, cb) => update(req.user, i, cb),
      (err) => {
        if (err) return next(err);
        res.status(200).send("success");
      });
  });

  app.post('/api/item/addAll', util.requirePrivileged, function(req, res, next) {
    
    if (!req.body)
      return res.status(400).send({ error: "Empty body" });

    imports = JSON.parse(req.body.imports);
    let set = new Set();
    imports.forEach(e => set.add(e.name));
    let names = _.map(imports, e => e.name);
    if (set.size !== imports.length)
      return res.status(400).send({ error: "Import contains duplicate" });
    Item.find({'name':{$in: names}}, (err, result) => {
      if (err) return next(err);
      if (result.length > 0)
        return res.status(405).send({ error: "Item(s) already exist!" , items: result.map(e=>e.name)});
      let items = imports.map(e=>{
        if (e.tags && e.tags.length) {
          e.tags.forEach(addTag);
        }
        let item = new Item(_.pick(e, allFields));
        item.quantity_available = item.quantity;
        return item;
      }
      );
      
      async.each(items,(item, cb) => item.save(cb),
        function (err) {
          if (err) {
            async.each(items, (doc,cb)=>doc.remove(cb), function () {
              return next("DB error");
            });
          } else {
              let quantity_arr = [];
              items.forEach(i=>quantity_arr.push(i.quantity));
              let name_arr = [];
              items.forEach(i=>name_arr.push(i.name));
              let arr = [];
              items.forEach(i=>arr.push(i));

              let log = new Log({
                init_user: req.user._id,
                item: arr,
                quantity: quantity_arr,
                event: "bulk import",
                name_list:name_arr
              });

              log.save(function(err){
                if(err){
                  console.log(err);
                }
              });

            return res.status(200).send("success");
          }
      });

    });

  });

}

function update(user, newItem, callback) {
  async.waterfall([
      (cb) => {
        if (!newItem) return cb({status:400, message: "Missing item body"});
        newItem._id = newItem._id || newItem.item || newItem.id;
        if (!newItem._id) return cb({status:400, message: "Missing ref id"});
        Item.findOne({ '_id': newItem._id })
        .exec((err, item) => {
          if (err) return cb(err);
          if (!item) return cb({status:405, message: "Missing item? Check the ID"});
          cb(null, item);
        })
      },
      (item, cb) => {
        if(newItem.quantity || newItem.quantity === 0)
          item.quantity_available += newItem.quantity - item.quantity;
        _.assign(item, _.pick(newItem, allFields));
        item.save((err, i)=>cb(err,i));
      },
      (item, cb) => {
        var message = `Updated item: ${item.name}`;
        if(user.status === "admin"){
          if(newItem.quantity < item.quantity){
            message = "Admin decreased quantity";
          }
          if(newItem.quantity > item.quantity){
            message = "Admin increased quantity";
          }
        } else{
          if(newItem.quantity < item.quantity){
            message = "Manager logged a loss";
          }
          if(newItem.quantity > item.quantity){
            message = "Manager logged an acquisition";
          }
        }
        var itemArray = [item._id];
        var itemQuantity = [item.quantity];
        var name_arr = [item.name];

        let log = new Log({
          init_user: user._id,
          item: itemArray,
          quantity: itemQuantity,
          event: message,
          name_list:name_arr
        });
        log.save(err=>{
          if(err) return cb(err);
          cb(null, item);
        })
      }
  ], callback);
}

function addTag(name) {
  Tag.findOne({name:name}, (err, tag)=>{
    if(err || tag) return;
    tag = new Tag({name: name});
    tag.save();
  })
}
