var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var User = mongoose.model('User');
var _ = require('lodash');

module.exports = {
	requireLogin: function(req, res, next) {
    if(!req.user) {
      res.status(403);
      res.json({
        "status": 403,
        "message": "Not Authorized"
      });
    } else {
      next();
    }
  },

  requireLoginGui: function(req, res, next) {
    if(!req.user) {
      res.redirect('/');
    } else {
      next();
    }
  },

  requirePrivileged: function(req, res, next) {
    if(!req.user || (req.user.status != "admin" && req.user.status != "manager")) {
      res.status(403);
      res.json({
        "status": 403,
        "message": "Not Authorized"
      });
    } else {
      next();
    }
  },

  requireLevel: function(levels) {
    return (req, res, next)=>{
      if(req.user && levels.find(e=>e===req.user.status)){
        next();
      } else {
        res.status(403);
        res.json({
          "status": 403,
          "message": "Not Authorized"
        });
      }
    }
  },
}
