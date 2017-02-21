//var jwt = require('jwt-simple');
//var validateUser = require('./../server/controllers/authenticator.js').validateUser;
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(req, res, next) {
 
  // When performing a cross domain request, you will recieve
  // a preflighted request first. This is to check if our the app
  // is safe. 
 
  // We skip the token outh for [OPTIONS] requests.
  //if(req.method == 'OPTIONS') next();

  let uid = req.session && req.session.token && JSON.parse(Buffer.from(req.session.token.split('.')[1], 'base64'));
  let token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
  uid = uid || (token && JSON.parse(Buffer.from(token.split('.')[1], 'base64')));
  let key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

  if (uid) {
    User.findOne({ '_id': uid._id }, function (err, user) {
      if (err) return res.status(500).json({"error":err});
      if (user) {
        req.user = user;
      }
      next();
    });
  } else if (key) {
    User.findOne({ 'apiKey': key }, function (err, user) {
      if (err) return res.status(500).json({"error":err});
      if (user) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }

  // if (token || key) {
  //   try {
  //     var decoded = jwt.decode(token, require('../config/secret.js')());
 
  //     if (decoded.exp <= Date.now()) {
  //       res.status(400);
  //       res.json({
  //         "status": 400,
  //         "message": "Token Expired"
  //       });
  //       return;
  //     }
 
  //     // Authorize the user to see if s/he can access our resources
 
  //     var dbUser = validateUser(key); // The key would be the logged in user's username
  //     if (dbUser) {
 
 
  //       if ((req.url.indexOf('admin') >= 0 && dbUser.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
  //         next(); // To move to next middleware
  //       } else {
  //         res.status(403);
  //         res.json({
  //           "status": 403,
  //           "message": "Not Authorized"
  //         });
  //         return;
  //       }
  //     } else {
  //       // No user with this name exists, respond back with a 401
  //       res.status(401);
  //       res.json({
  //         "status": 401,
  //         "message": "Invalid User"
  //       });
  //       return;
  //     }
 
  //   } catch (err) {
  //     res.status(500);
  //     res.json({
  //       "status": 500,
  //       "message": "Oops something went wrong",
  //       "error": err
  //     });
  //   }
  // } else {
  //   res.status(401);
  //   res.json({
  //     "status": 401,
  //     "message": "Invalid Token or Key"
  //   });
  //   return;
  // }
};