var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
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
  .populate('items.item user')
  .exec((err, results) => {
    if(err) return console.log(err);
    results.forEach(request => {
      if(request.user && request.user.email){
        let user = request.user;
        Email.find({ dates: { $exists: true, $not: {$size: 0} } })
        .exec((err, results) => {
          if (err) return console.log(err);
          results.forEach(e => {
            dates = e.dates;
            var new_dates = [];
            for(let i = 0; i < dates.length; i++){
              dates[i] = dates[i].trim();
              if(dates[i] > date_now) {
                new_dates.push(dates[i]);
              } else {
                let body = e.body;
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
                  subject: e.subject,
                  text: body,
                });
              }
            }
            e.dates = new_dates;
            e.save();
          });
        });
      }
    });
  });
});
