var nodemailer = require('nodemailer');
const util = require('./util.js');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'dcssa2016@gmail.com', // Your email id
        pass: 'dqpenfuhmgpxnykg' // Your password
    }
})

function send({from, to, subject, text, html}, cb) {
    const mailOptions = {
        from: from || 'ECE Inventory Manager <noreply@duke.edu>',
        to: to,
        subject: subject,
        text: text,
    }
    transporter.sendMail(mailOptions, cb);
}

module.exports = {
    
    send: send,

    routes: function(app) {
        app.get('/api/mail/test', util.requireLogin, function(req, res, next) {
          transporter.verify(function(error, success) {
             if (error) {
                  next(error);
             } else {
                  return res.status(200).send(success);
             }
          });
        });

        // app.get('/api/mail/send', util.requireLogin, function(req, res, next) {
        //   send({
        //     to:'mym987@gmail.com',
        //     subject:'Hello',
        //     text:'Hello!'
        //   }, function(error, success) {
        //      if (error) {
        //           next(error);
        //      } else {
        //           return res.status(200).send(success);
        //      }
        //   });
        // });

    }
}
    
// }