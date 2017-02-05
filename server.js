/********************************************************/
/*                    SERVER.JS                         */
/********************************************************/

var express = require('express');
var path = require('path');

// instantiate the app
var app = express();

require('./config/mongoose.js');

// require bodyParser since we need to handle post data for adding a user
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());
app.use(bodyParser.json()); // ****

// static file server pointing to the "client" directory
app.use(express.static(path.join(__dirname, './client')));

//passport intialize
var passport = require('passport');
require('./config/passport');

app.use(passport.initialize());      


var routes = require('./config/routes.js')(app);

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('./sslcert/domain.key', 'utf8');
var certificate = fs.readFileSync('./sslcert/domain.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);



app.listen(8000, function() {
  console.log('app on port 8000');
});
