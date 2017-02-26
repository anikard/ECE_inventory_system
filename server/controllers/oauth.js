const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const request = require('request');

module.exports = (app) => {
  app.get('/api/auth/oauth', (req, res, next) => {
    auth(req, res, next);
  });

  app.get('/api/auth/code', (req, res, next) => {
    code(req, res, next);
  });
}

const code_endpoint = 'https://localhost:8443/api/auth/code';

const oauth2 = require('simple-oauth2').create({
  client: {
    id: 'ece-inventory-manager',
    secret: 'G#p8nd#uoKQGMnDdVby=8kX$aIbM9f4iKU$#bY@*v1RkMWnoN%',
  },
  auth: {
    tokenHost: 'https://oauth.oit.duke.edu/',
    tokenPath: '/oauth/token.php',
    authorizePath: '/oauth/authorize.php',
  },
});

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
      'x-api-key': 'ece-inventory-manager',
      'Authorization': "Bearer " + token,
    }
  };
}


/**
Do we need this method at all?

**/
function auth (req, res, next) {

  console.log("gets to backend")

  if(req.user){
    return res.redirect('/dispProducts');
  }
  res.redirect(authorizationUri);
};


/**
What does this code do? What parameters does it from front end? Does it need a 
code, a netid, a displayName? Give us some information on how this is supposed to work

**/
function code(req, res, next) {
  const code = req.query.code;
  const options = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: code_endpoint,
    client_id: 'ece-inventory-manager'
  };
  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      return res.json('Authentication failed');
    }

    const token = oauth2.accessToken.create(result);
    const accessToken = token.token.access_token;

    request(requestOptions(accessToken), (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);

        console.log(info);

        //res.status(200).json(info);
        User.findOne({netId: info.netid}, (err, user)=>{
          if(err){
            res.status(500).json({error: err});
            return;
          }
          if(user){
            // Found user
            let token = user.generateJWT();
            req.session.token = token;
            return res.redirect('/dispProducts');
            //return res.status(200).json({token: token});
          } else {
            // Create a new user
            let user = new User({
              netId: info.netid,
              name: info.displayName,
              status: "user"
            });
            user.save(function (err){
              if(err){ return next(err); }
              let token = user.generateJWT();
              req.session.token = token;
              return res.redirect('/dispProducts');
              //return res.status(200).json({token: token});
            });
          }
        });
      }
    });
  });
};
