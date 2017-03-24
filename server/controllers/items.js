var mongoose = require('mongoose');
var _ = require('lodash');
var Item = mongoose.model('Item');
var Field = mongoose.model('Field');
var Log = mongoose.model('Log');
var util = require('./util.js');
var async = require("async");

module.exports = (app) => {
  app.get('/api/item/show', util.requireLogin, function(req, res, next) {
    Item.find({})
    .limit(parseInt(req.query.limit) || 200)
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
      if (err) {
        return res.status(500).send({ error: err });
      }
      if (item) {
        return res.status(405).send({ error: "Item already exist!" });
      }
      props = _.pick(req.body, ['name','quantity', 'quantity_available', 'location','model','description','tags','image','fields']);
      item = new Item(props);
      item.save(function(err){
        if(err){
          res.status(500).send({ error: err })
        } else {
          var itemArray = [item._id];
          var itemQuantity = [item.quantity];
          var name_arr = [item.name];
          let log = new Log({
            init_user: req.user._id,
            item: itemArray,
            quantity: itemQuantity,
            quantity_available: itemQuantity,
            event: "item created",
            name_list:name_arr
          });

          log.save(function(err){
            if(err){
              res.status(500).send({ error: err });
              return;
            }
          });




            res.status(200).send("success"); //  end the function to return
          }
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
    if (! req.body._id && !req.body.item) return res.status(400).send({ error: "Missing ref id" });
    req.body._id = req.body._id || req.body.item;
    props = _.pick(req.body, ['name','quantity', 'quantity_available', 'location','model','description','tags','image','fields']);

    var currQuantity = 0;

    Item.findOne({ '_id': req.body._id }, function (err, item) {
      if (err) {
        return res.status(500).send({ error: err });
      }
      if (!item) {
        return res.status(405).send({ error: "Missing item? Check the ID" });
      }

      currQuantity = item.quantity;

      _.assign(item, props);

      var message = "updated an item";

      if(req.user.status === "admin"){
        if(req.body.quantity < currQuantity){
          message = "admin decreased quantity";
        }
        if(req.body.quantity > currQuantity){
          message = "admin increased quantity";
        }
      }
      else{

        if(req.body.quantity < currQuantity){
          message = "manager logged a loss";
        }
        if(req.body.quantity > currQuantity){
          message = "manager logged an acquisition";
        }

      }

      var itemArray = [item._id];
      var itemQuantity = [req.body.quantity];
      var name_arr = [item.name];

      let log = new Log({
        init_user: req.user._id,
        item: itemArray,
        quantity: itemQuantity,
        event: message,
        name_list:name_arr
      });
      log.save(function(err){
        if(err){
          res.status(500).send({ error: err });
          return;
        }
      });
      res.status(200).json(item);
    });

    Item.findByIdAndUpdate(
      req.body._id,
      {$set: props},
      { new: true },
      function (err, item) {
        if (err) res.status(500).send({ error: err });
        else {



        }
      });
  });

  app.post('/api/item/addAll', util.requirePrivileged, function(req, res, next) {
    // console.log("IN ADD ALL ITEMS");
    // console.log(req.body);

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
      let items = imports.map(e=>
        new Item(_.pick(e, ['name','quantity','location','model','description','tags','image','fields']))
      );
      async.each(items,(item, cb) => item.save(cb),
        function (err) {
          if (err) {
            async.each(items, (doc,cb)=>doc.remove(cb), function () {
              console.log('Rollback done.');
              return next("DB error");
            });
          } else {
            return res.status(200).send("success");
          }
      });
    });

  });

}
