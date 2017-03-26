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


  app.post('/api/email/update', util.requirePrivileged, function(req, res, next) {  

    props = _.pick(req.body, ['subject','body','send_dates']);
    
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
