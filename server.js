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

var routes = require('./config/routes.js')(app);

app.listen(8000, function() {
  console.log('app on port 8000');
});
