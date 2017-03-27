var mongoose = require('mongoose');
var schedule = require('node-schedule');
var mailer = require('./mailer.js');
var User = mongoose.model('User');
var Email = mongoose.model('Email');
var Request = mongoose.model('Request');
var dateFormat = require('dateformat');


//var date = new Date(2012, 11, 21, 5, 30, 0);

var s = schedule.scheduleJob('*/5 * * * * *', function(){
  var now = new Date();
  var date_now = dateFormat(now, "yyyy-mm-dd");
  Request.find({status: "onLoan"})
  .populate('user')
  .exec((err, results) => {
    if(err) return console.log(err);
    var emails = new Array();
    results.forEach(r => {
      if(r.user && r.user.email)
        emails.push(r.user.email);
    });
    Email.find({ dates: { $exists: true, $not: {$size: 0} } })
    .exec((err, results) => {
      if (err) return console.log(err);
      results.forEach(e => {
        dates = e.dates;
        var new_dates = [];
        for(let i = 0; i < dates.length; i++){
          if(dates[i] < date_now) {
            new_dates.push(dates[i]);
          } else {
          	emails.forEach(address=>{
          		console.log({
          			to: address,
          			subject: e.subjectTag && `${e.subjectTag} ${e.subject}` || e.subject,
          			text: e.body,
          		})
          	})
          }
        }
        e.dates = new_dates;
        e.save();
      });
    });
  });
});