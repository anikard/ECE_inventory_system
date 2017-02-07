var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');

module.exports = (function() {
  return {
    register: function(req, res, next){
     console.log(req.body);
     if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'});
    }

    var user = new User();

    user.username = req.body.username;

    user.setPassword(req.body.password)

    user.status = "user";  
      
    user.save(function (err){
      if(err){ return next(err); }

      return res.json({token: user.generateJWT()})

    });

  },

  createAdmin: function(req, res, next){
    User.find({status: 'admin'}, function(err, admin) {
        if(err) {
          res.status(400).json({error: err});
        } else {
          if(admin){
            res.status(400).json({message: 'Admin already exist.'});
            return;
          }
           if(!req.body.username || !req.body.password){
            return res.status(400).json({message: 'Please fill out all fields'});
          }
          var user = new User();
          user.username = req.body.username;
          user.setPassword(req.body.password);
          user.status = "admin";

          user.save(function (err){
            if(err){ return next(err); }

            return res.json({token: user.generateJWT()})

          });
        }
    });
  },

  login:  function(req, res, next){
    if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'});
    }

    passport.authenticate('local', function(err, user, info){
      if(err){ return next(err); }

      if(user){
        return res.json({token: user.generateJWT()});
      } else {
        return res.status(401).json(info);
      }
    })(req, res, next);

  }

}


})();
