var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var schedule = require('node-schedule');
var mailer = require('./mailer.js');
var User = mongoose.model('User');
var Email = mongoose.model('Email');
var Request = mongoose.model('Request');
var dateFormat = require('dateformat');
var async = require("async");


//var date = new Date(2012, 11, 21, 5, 30, 0);

var s = schedule.scheduleJob('*/5 * * * * *', function(){
  var now = new Date();
  var date_now = dateFormat(now, "yyyy-mm-dd");
  Email.find({ dates: { $exists: true, $not: {$size: 0} } })
  .exec((err, emails) => {
    if(err) return console.log(err);
    emails.forEach(email => {
      var new_dates = [];
      email.dates.forEach(date => {
        date = date.trim();
        if(date > date_now) {
          new_dates.push(date);
        } else {
          send(email, (err) => {
            if (err) console.log(err);
          });
        }
      });
      email.dates = new_dates;
      email.save();
    });
  });
});

function send(email, callback) {
  Request.find({status: "onLoan"})
  .populate('items.item user')
  .exec((err, requests) => {
    if(err) return console.log(err);
    async.each(requests,
      (request, cb) => {
        let user = request.user;
        if(user && user.email) {
          let body = email.body;
          body += "\n----------------------------------\nRequest Summary\n";
          body += `User: ${user.name} (${user.username})\n`;
          body += `Reason: ${request.reason}\n`;
          body += `Note: ${request.note || 'N/A'}\n`;
          body += `Status: ${request.status}\n`;
          body += `Type: ${request.type}\n`;
          body += `Date: ${request.date}\n\n`;
          body += `Items:\n`;
          request.items.forEach(i=>body+=`Name: ${i.item.name}\t\tQuantity: ${i.quantity}\n`);
          mailer.send({
            to: user.email,
            subject: email.subject,
            text: body,
          }, cb);
        }
      },
      callback);
    });
}
