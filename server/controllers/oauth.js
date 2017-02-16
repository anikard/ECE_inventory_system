var mongoose = require('mongoose');
var User = mongoose.model('User');
var passport = require('passport');
const request = require('request');
const https = require('https');

const client_id = 'ece-inventory-manager';
const client_secret = 'G#p8nd#uoKQGMnDdVby=8kX$aIbM9f4iKU$#bY@*v1RkMWnoN%';

const oauth2 = require('simple-oauth2').create({
  client: {
    id: client_id,
    secret: client_secret,
  },
  auth: {
    tokenHost: 'https://oauth.oit.duke.edu/',
    tokenPath: '/oauth/token.php',
    authorizePath: '/oauth/authorize.php',
  },
});

const code_endpoint = 'https://localhost:8443/api/oauth/code';

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: code_endpoint,
  scope: 'basic identity:netid:read',
  state: 'Xg2dAmvMEn8S3ND9GorD3(#0/!~',
});

const requestOptions = (token) => {
  return {
    method: 'GET',
    uri: 'https://api.colab.duke.edu/identity/v1/',
    headers: {
      'Accept': "application/json",
      'x-api-key': client_id,
      'Authorization': "Bearer " + token,
    }
  };
}

const colaboptions = (token) => {
  return {
    hostname: 'api.colab.duke.edu',
    port: 443,
    path: '/identity/v1/',
    method: 'GET',
    headers: {
      'Content-Type': "application/json",
        'x-api-key': client_id,
        'Authorization': "Bearer " + token,
    }
  };
}

function parseReponse(response, body) {
  debug('Checking response body', body);

  try {
    body = JSON.parse(body);
  } catch (e) {
    /* The OAuth2 server does not return a valid JSON */
  }

  if (response.statusCode >= 400) {
    return Promise.reject(new HTTPError(response.statusCode, body));
  }

  return Promise.resolve(body);
}

module.exports = (function() {
  return {
    auth: (req, res) => {
      res.redirect(authorizationUri);
    },

    code: (req, res) => {
      const code = req.query.code;
      console.log(code);
      const options = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: code_endpoint,
        client_id: 'ece-inventory-manager'
      };
      oauth2.authorizationCode.getToken(options, (error, result) => {
        if (error) {
          console.error('Access Token Error', error);
          return res.json('Authentication failed');
        }

        console.log('The resulting token: ', result);
        const token = oauth2.accessToken.create(result);
        const accessToken = token.token.access_token;

        request(requestOptions(accessToken), (error, response, body) => {
          if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            res.status(200).json(info);
          }
        });
        
      });
    },

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
          user.setPassword(req.body.password);
          user.status = "admin";

          user.save(function (err){
            if(err){ return next(err); }

            return res.json({token: user.generateJWT()})

          });
        }
    });
  },

  hackAdmin: function(req, res, next){
    User.findOne({username: 'admin'}, function(err, admin) {
        if(err) {
          res.status(400).json({error: err});
        } else {
          if(admin){
            res.status(400).json({message: 'Admin already exist.'});
            return;
          }
          var user = new User();
          user.username = "admin";
          user.setPassword("admin");
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
