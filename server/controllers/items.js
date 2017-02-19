var mongoose = require('mongoose');
var _ = require('lodash');
var Item = mongoose.model('Item');
var Field = mongoose.model('Field');

module.exports = (app) => {
  app.get('/api/v2/item/show', function(req, res, next) {
    Item.find({}, function(err, results) {
        if(err) {
          res.status(500).send({ error: err });
        } else {
          res.status(200).json(results);
        }
    });
  });

  app.post('/api/v2/item/add', function(req, res, next) {
    Item.findOne({ 'name': req.body.name }, function (err, item) {
      if (err) {
        return res.status(500).send({ error: err });
      }
      if (item) {
        res.status(405).send({ error: "Item already exist!" });
      }
      Field.find({}, 'name', function (err, results) {
        if (err) return res.status(500).send({ error: err });
        var fields = new Array;
        results.forEach(e => {fields.push(e.name)});
        console.log(fields);
        props = _.pick(req.body, ['name','quantity','model','description','tags','image']);
        props.fields = _.pick(req.body, fields);
        console.log(props);
        item = new Item(props);
        item.save(function(err){
            if(err){
              res.status(500).send({ error: err })
            } else {
              res.status(200).send("success"); //  end the function to return
            }
        });
      })
    });
  });

  app.post('/api/v2/item/del', function(req, res, next) {
    Item.remove({ _id: req.body._id},
      function (err, request) {
        if (err) {
          res.status(500).send({ error: err });
        } else {
          res.status(200).send("Successfully deleted a item!");
        }
        res.end();
      }
    );
  });

  app.post('/api/v2/item/update', function(req, res, next) {
    if (! req.body._id) return res.status(400).send({ error: "Missing ref id" });
    Field.find({}, 'name', function (err, results) {
      if (err) return res.status(500).send({ error: err });
      var fields = new Array;
      results.forEach(e => {fields.push(e.name)});
      props = _.pick(req.body, ['name','quantity','model','description','tags','image']);
      props.fields = _.pick(req.body, fields);
      
      Item.findByIdAndUpdate(
        req.body._id,
        {$set: props},
        { new: true },
        function (err, item) {
          if (err) console.log("Update item Error");
          res.json(item);
        });
    });
  });
}
