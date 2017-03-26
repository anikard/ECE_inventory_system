var mongoose = require('mongoose');
var _ = require('lodash');
var Email = mongoose.model('Email');
var util = require('./util.js');


module.exports = (app) => {
  app.get('/api/email/show', util.requireLogin, function(req, res, next) {
    Email.find({})
    .limit(parseInt(req.query.limit) || 200)
    .exec((err, results) => {
      if(err) {
        res.status(500).send({ error: err });
      } else {
        res.status(200).json(results);
      }
    })
  });

  app.post('/api/email/add', util.requirePrivileged, function(req, res, next) {

    Email.findOne({ '_id': req.body._id }, function (err, email) {
      if (err) {
        return res.status(500).send({ error: err });
      }
      if (email) {
        return res.status(405).send({ error: "Email already exist!" });
      }
      console.log("IN ADD for email");
      console.log(req.body);

      props = _.pick(req.body, ['subject','body','send_dates']);
      email = new Email(props);
      email.save(function(err){
        if(err){
          res.status(500).send({ error: err })
        } else {
            res.status(200).send("success"); //  end the function to return
          }
        });
    });
  });

  // app.post('/api/item/del', util.requirePrivileged, function(req, res, next) {
  //   if (! req.body._id && !req.body.item && !req.body.name)
  //     return res.status(400).send({ error: "Missing _id or name" });
  //   req.body._id = req.body._id || req.body.item;
  //   let query = req.body._id ? {_id: req.body._id} : {name: req.body.name};
  //   Item.remove(query,
  //     (err, request) => {
  //       if (err) {
  //         res.status(500).send({ error: err });
  //       } else {

  //         var itemArray = [req.body._id];
  //         var itemName = [req.body.name];
  //         let log = new Log({
  //           init_user: req.user._id,
  //           item: itemArray,
  //           event: "item deleted",
  //           name_list:itemName,
  //         });

  //         log.save(function(err){

  //           if(err){
  //             res.status(500).send({ error: err });
  //             return;
  //           }
  //         });



  //         res.status(200).send("Successfully deleted a item!");
  //       }
  //       res.end();
  //     }
  //     );
  // });

  app.post('/api/email/update', util.requirePrivileged, function(req, res, next) {
    // if (! req.body._id && !req.body.item) return res.status(400).send({ error: "Missing ref id" });
    // req.body._id = req.body._id || req.body.item;


    props = _.pick(req.body, ['subject','body','send_dates']);
    
    // var currQuantity = 0;

    Email.findOne({ '_id': req.body._id }, function (err, email) {
      if (err) {
        return res.status(500).send({ error: err });
      }
      if (!email) {
        return res.status(405).send({ error: "Missing email? Check the ID" });
      }

      console.log("IN update for email");
      console.log(req.body);


      _.assign(email, props);

      var message = "updated an email";


      res.status(200).json(email);

    });


    Email.findByIdAndUpdate(
      req.body._id,
      {$set: props},
      { new: true },
      function (err, email) {
        if (err) res.status(500).send({ error: err });
        else {

        }
      });


  });
}
