var mongoose = require('mongoose');
var _ = require('lodash');
var Item = mongoose.model('Item');
var Field = mongoose.model('Field');
var Log = mongoose.model('Log');
var util = require('./util.js');

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
      props = _.pick(req.body, ['name','quantity','location','model','description','tags','image','fields']);
      item = new Item(props);
      item.save(function(err){
          if(err){
            res.status(500).send({ error: err })
          } else {


            var itemArray = [item._id];
            let log = new Log({
            init_user: req.user._id,
            item: itemArray,
            event: "item created",
            rec_user: req.user._id,
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
          res.status(200).send("Successfully deleted a item!");
        }
        res.end();
      }
    );
  });

  app.post('/api/item/update', util.requirePrivileged, function(req, res, next) {
    if (! req.body._id && !req.body.item) return res.status(400).send({ error: "Missing ref id" });
    req.body._id = req.body._id || req.body.item;
    props = _.pick(req.body, ['name','quantity','location','model','description','tags','image','fields']);
    Item.findByIdAndUpdate(
    req.body._id,
    {$set: props},
    { new: true },
    function (err, item) {
      if (err) res.status(500).send({ error: err });
      else res.status(200).json(item);
    });


    // Field.find({}, 'name', function (err, results) {
    //   if (err) return res.status(500).send({ error: err });
    //   var fields = new Array;
    //   results.forEach(e => {fields.push(e.name)});

    //   props.fields = _.pick(req.body, fields);


    // });
  });
}
