var nodemailer = require('nodemailer');
const util = require('./util.js');

const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
        user: 'apikey', // Your email id
        pass: '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' // Your password
    }
})

function send({from, to, subject, text, html}, cb) {
    const mailOptions = {
        from: from || 'noreply@duke.edu',
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
                  console.log(error);
             } else {
                  console.log('Server is ready to take our messages');
                  return res.status(200).send("Server is ready to take our messages");
             }
          });
        });
    }
}

// function handleSayHello(req, res) {
//     // Not the movie transporter!
//     var text = 'Hello world from \n\n' + req.body.name;
//     var mailOptions = {
//         from: 'example@gmail.com>', // sender address
//         to: 'receiver@destination.com', // list of receivers
//         subject: 'Email Example', // Subject line
//         text: text //, // plaintext body
//         // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
//     };

//     transporter.sendMail(mailOptions, function(error, info){
//             if(error){
//                 console.log(error);
//                 res.json({yo: 'error'});
//             }else{
//                 console.log('Message sent: ' + info.response);
//                 res.json({yo: info.response});
//             };
//         });
    
// }