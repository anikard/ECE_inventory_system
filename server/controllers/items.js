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
    /*
      {
        item_name: item name
        fields: per asset custome fields
        assetTag: optional tag
      }
      return : new asset json object
    */
    let name = req.body.item_name || req.body.name || req.body.item;
    if(!name) return next({status: 400, error: `Item id is not supplied`});
    Item.findOne({name: name})
    .exec((err,item) => {
      if(err) return next(err);
      if(!item) return next({status: 400, error: `${item.name} does not exist.`});
      if(!item.isAsset) return next({status: 400, error: `${item.name} is not an asset.`});
      let tag = randomInt(0, 10000000000);
      if(req.body.assetTag)
        tag = req.body.assetTag.toString();
      let asset = new Asset({
        item: item._id,
        assetTag: tag,
      })
      let assets = [];
      if(item.assets && item.assets.length)
        assets = item.assets;
      assets.push(asset);
      item.assets = assets;
      item.quantity_available+=1;
      item.quantity+=1;
      asset.save((err)=>{
        if(err)return next(err);
        item.save(err=>{
          if(err)return next(err);
          res.status(200).send(asset);
        })
      });
      
    });
  });

  app.all('/api/asset/del', util.requireLogin, function(req, res, next) {
    /*
      {
        id: asset id to delete
      }
      OR
      {
        assetTag: asset tag to delete
      }
    */
    let id = req.body._id || req.body.asset || req.body.id
              || req.query._id || req.query.asset || req.query.id;

    let tag = req.body.assetTag || req.body.tag
              || req.query.assetTag || req.query.tag;
    if (!id && !tag) return next({status: 400, error: `Field missing`});
    if(id){
      Asset.findOneAndRemove({_id:id}, (err, asset)=>{
        if(err) return next(err);
        if(!asset) return next({status: 400, error: `No such asset`});
        Item.findOne({_id:asset.item}, (err, item)=>{
          item.quantity-=1;
          item.quantity_available-=1;
          let assets = [];
          for(let i=0;i<item.assets.length;i++){
            if(item.assets[i]!==asset._id)
              assets.push(item.assets[i]);
          }
          item.assets = assets;
          item.save((err)=>{
            if(err)return next(err);
            res.status(200).send(asset);
          })
        });
      })
    } else {
      Asset.findOneAndRemove({assetTag:tag}, (err, asset)=>{
        if(err) return next(err);
        if(!asset) return next({status: 400, error: `No such asset`});
        Item.findOne({_id:asset.item}, (err, item)=>{
          item.quantity-=1;
          item.quantity_available-=1;
          let assets = [];
          for(let i=0;i<item.assets.length;i++){
            if(item.assets[i]!==asset._id)
              assets.push(item.assets[i]);
          }
          item.assets = assets;
          item.save((err)=>{
            if(err)return next(err);
            res.status(200).send(asset);
          })
        });
      })
    }
  });

  app.all('/api/asset/toAsset', util.requireLogin, function(req, res, next) {
    /*
      {
        name: item name
      }
      return a matching item and all its assets (in an array)
    */
    let name = req.body.item_name||req.body.item||req.body.name
              ||req.query.item_name||req.query.item||req.query.name;
    if(!name) return next({status: 400, error: `Item name is not supplied`});
    Item.findOne({name: name})
    .exec((err,item) => {
      if(err) return next(err);
      if(item.isAsset) return next({status: 400, error: `${item.name} is already an asset.`});
      item.isAsset = true;
      let start = randomInt(0, 1000000);
      let assets = [];

      for(let i=0;i<item.quantity;i++){
        let tag = start*10000+i;
        let asset = new Asset({
          item: item._id,
          assetTag: tag.toString(),
          fields: TODOTODO
        });
        assets.push(asset);
        asset.save();
      }
      item.assets = assets;
      item.save(err=>{
        if(err)return next(err);
        res.status(200).send(item);
      })
    });
  });

  app.all('/api/asset/fromAsset', util.requireLogin, function(req, res, next) {
    /*
      {
        name: item name
      }
      return a matching item and all its assets (in an array)
    */
    let name = req.body.item_name||req.body.item||req.body.name
              ||req.query.item_name||req.query.item||req.query.name;

    if(!name) return next({status: 400, error: `Item name is not supplied`});
    Item.findOne({name: name})
    .populate(assets)
    .exec((err,item) => {
      if(err) return next(err);
      if(!item.isAsset) return next({status: 400, error: `${item.name} is not an asset.`});
      item.isAsset = false;
      if(item.assets && item.assets.length) {
        item.assets.forEach(i=>i.remove());
      } 
      item.assets = [];
      item.save(err=>{
        if(err)return next(err);
        res.status(200).send(item);
      });
    });
  });

  app.all('/api/asset/show', util.requireLogin, function(req, res, next) {
    /*
      {
        name: item name
      }
      return a matching item and all its assets (in an array)
    */
    let name = req.query.name||req.query.item_name||req.query.item;
    if(!name) return next({status: 400, error: `Item name is not supplied`});
    Item.findOne({name: name})
    .populate('assets')
    .exec((err, result) => {
      if(err)return next(err);
      res.status(200).json(result.assets);
    })
  });

  app.post('/api/asset/update', util.requirePrivileged, function(req, res, next) {
    asset_update(req.user, req.body, (err, asset)=>{
      if(err) return next(err);
      res.status(200).send(asset);
    });
    
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

      if (item.isAsset) {
        let start = randomInt(0, 1000000);
        let assets = [];

        let assetsFields = {};
        for (var i = 0; i < req.body.assetFields.length; i++) {
          assetsFields[req.body.assetFields[i].name] = "";
        }


        for(let i=0;i<item.quantity;i++){
          let tag = start*10000+i;
          let asset = new Asset({
            item: item._id,
            assetTag: tag.toString(),
            fields: assetsFields
          });
          assets.push(asset);
          asset.save();
        }
        item.assets = assets;
      }

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

// todo
function asset_update(user, newAsset, callback) {
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

function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}