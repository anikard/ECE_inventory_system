var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var User = mongoose.model('User');
var passport = require('passport');

module.exports = (app) => {
  app.post('/api/auth/login', function(req, res, next){
    login(req, res, next);
  });

  app.get('/api/auth/logout', function(req, res, next) {
    logout(req, res, next);
  });

  app.post('/api/auth/createAdmin', function(req, res, next){
    createAdmin(req, res, next);
  });

  app.get('/api/auth/hackAdmin', function(req, res, next){
    hackAdmin(req, res, next);
  });

  app.get('/api/auth/admin', function(req, res, next){
    loginAdmin(req, res, next);
  });
}

function register(req, res, next) {
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User({
    username: req.body.username,
    name: req.body.name,
    status: 'user'
  });
  user.setPassword(req.body.password)

  user.status = "user";

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})

  });
}

function login(req, res, next) {
  console.log("printed the req")

  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      token = user.generateJWT();
      req.session.token = token;
      return res.json("success");
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
}

function logout(req, res, next) {
  req.session.destroy((err)=>{
    if (err) res.status(400).json({error: err});
    else res.redirect('/');
  });
}

function createAdmin(req, res, next) {
  User.findOne({status: 'admin'}, function(err, admin) {
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
        user.name = req.body.name;
        user.setPassword(req.body.password);
        user.status = "admin";

        user.save(function (err){
          if(err){ return next(err); }

          return res.json({token: user.generateJWT()})

        });
      }
  });
}
/**
Can we just delete hackAdmin at this point? does createAdmin already not cover it?
**/
function hackAdmin(req, res, next) {
  User.findOne({username: 'admin'}, function(err, admin) {
      if(err) {
        res.status(400).json({error: err});
      } else {
        if(admin){
          res.status(400).json({message: 'Admin already exist.'});
          return;
        }
        var user = new User();
        user.name = "Admin";
        user.username = "admin";
        user.setPassword("admin");
        user.status = "admin";

        user.save(function (err){
          if(err){ return next(err); }

          return res.json({token: user.generateJWT()})

        });
      }
  });
}

function loginAdmin(req, res, next) {
  User.findOne({username: 'admin'}, function(err, admin) {
      if(err) {
        res.status(400).json({error: err});
      } else {
        if(admin){
          req.session.token = admin.generateJWT();
          return res.status(200).send("success");
        }
        var user = new User();
        user.name = "Admin";
        user.username = "admin";
        user.setPassword("admin");
        user.status = "admin";

        user.save(function (err){
          if(err){ return next(err); }
          req.session.token = user.generateJWT();
          return res.status(200).send("success");
        });
      }
  });
}
