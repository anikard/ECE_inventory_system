/********************************************************/
/*						CONTROLLER						*/
/********************************************************/

var mongoose = require('mongoose');
var Item = mongoose.model('Item');

module.exports = (app) => {
  app.get('/api/v2/item/show', function(req, res, next) {
    Item.find({}, function(err, results) {
        if(err) {
          console.log(err);
        } else {
          res.json(results);
        }
    })
  });

  app.post('/api/v2/item/add', function(req, res, next) {
    Item.findOne({ 'name': req.body.name }, function (err, item) {
      if (err) {
        res.status(500).send({ error: err });
        return;
      }
      if (item) {
        res.status(405).send({ error: "Item already exist!" });
      } 
      var newItem = new Item({
        name: req.body.name,
        description: req.body.description,
        quantity: req.body.quantity,
        image: req.body.image,
        model: req.body.model,
        location: req.body.location,
        tags: req.body.tags,
      });
      newItem.save(function(err){
          if(err){
            res.status(500).send({ error: err })
          } else {
            res.status(200).end(); //  end the function to return
          }
      });
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
      Item.findByIdAndUpdate(
        req.body._id,
        {$set: {
          name: req.body.name,
          description: req.body.description,
          quantity: req.body.quantity,
          model: req.body.model,
          location: req.body.location,
          tags: req.body.tags,
          //TODO: image_url
        }},
        { new: true },
        function (err, item) {
          if (err) console.log("Update item Error");
          res.json(item);
        });
    }
  });
}
