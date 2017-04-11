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
var formidable = require("formidable");
var path = require('path');
const fs = require('fs');

module.exports = {
    
    send: null,

    routes: function(app) {
      app.get('/api/backfill/show', util.requireLogin, show);
      app.post('/api/backfill/add', util.requireLogin, add);
      app.post('/api/backfill/update', util.requireLogin, update);
      app.post('/api/backfill/close', util.requireLogin, close);
      app.post('/api/backfill/approve', util.requireLogin, approve);
      app.post('/api/backfill/deny', util.requireLogin, deny);
      app.post('/api/backfill/fulfill', util.requireLogin, done);
      app.post('/api/backfill/upload', util.requireLogin, upload);

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
  if(req.body.status === "requested" || req.body.status === "inTransit")
    backfill.status = req.body.status;
  verifyAndSave(backfill, (err, backfill)=>{
    if(err) return next(err);
    email(backfill, "A new backfill request has been added");
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
      email(backfill, "Your backfill request has been updated");
      res.status(200).json(backfill);
    })
  }) 
}

function close (req, res, next) {
  setStatus(req.body._id || req.body.id || req.body.backfill, "closed", (err, backfill)=>{
    if(err) return next(err);
    email(backfill, "Your backfill request has been closed");
    res.status(200).json(backfill);
  })
}

function approve (req, res, next) {
  setStatus(req.body._id || req.body.id || req.body.backfill, "inTransit", (err, backfill)=>{
    if(err) return next(err);
    email(backfill, "Your backfill request has been approved");
    res.status(200).json(backfill);
  })
}

function deny (req, res, next) {
  setStatus(req.body._id || req.body.id || req.body.backfill, "denied", (err, backfill)=>{
    if(err) return next(err);
    email(backfill, "Your backfill request has been denied");
    res.status(200).json(backfill);
  })
}

function done (req, res, next) {
  setStatus(req.body._id || req.body.id || req.body.backfill, "fulfilled", (err, backfill)=>{
    if(err) return next(err);
    email(backfill, "Your backfill request is complete");
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

function email(backfill, subject){
  backfill.populate('request', (err, backfill)=>{
    if(!backfill) return console.log('Populate fail in backfill');
    let request = backfill.request;
    if(err || !request.user || !request.user.email) return;
    let user = request.user;
    let body = "Request Summary\n";
    body += `User: ${user.name} (${user.username})\n`;
    body += `Reason: ${request.reason}\n`;
    body += `Note: ${request.note || 'N/A'}\n`;
    body += `Status: ${request.status}\n`;
    body += `Type: ${request.type}\n`;
    body += `Date: ${request.date}\n\n`;
    body += `Items:\n`;
    request.items.forEach(i=>body+=`Name: ${i.item.name}\t\tQuantity: ${i.quantity}\n`);
    body += `\n\n`;
    body += 'Backfill Summary\n';
    body += `Date: ${request.date}\n\n`;
    body += `Items:\n`;
    backfill.items.forEach(i=>body+=`Name: ${i.item.name}\t\tQuantity: ${i.quantity}\n`);
    mailer.send({
      to: user.email,
      subject: subject,
      text: body,
    });
  })

}

function upload(req, res, next) {
  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../../uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

}

