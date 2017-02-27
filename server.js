/********************************************************/
/*                    SERVER.JS                         */
/********************************************************/

const cluster = require('cluster');
const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require("body-parser");
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const engine = require('consolidate');

const numCPUs = require('os').cpus().length;

// instantiate the app
var app = express();
app.use(compression());
require('./config/mongoose.js');

// require bodyParser since we need to handle post data for adding a user
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static file server pointing to the "client" directory
app.use(express.static(path.join(__dirname, './client')));
// app.set('views', __dirname + '/client');
// app.engine('html', engine.mustache);
// app.set('view engine', 'html');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: '6ECjhQp5BK6ZUp',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

//passport intialize
require('./config/passport');
app.use(passport.initialize());      

var routes = require('./config/routes.js')(app);

const privateKey  = fs.readFileSync('./sslcert/domain.key', 'utf8');
const certificate = fs.readFileSync('./sslcert/domain.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  // http.createServer(app).listen(8000, ()=>{
  // 	console.log(`Worker ${process.pid} started, listening on port 8000`);
  // });
  https.createServer(credentials, app).listen(8443, ()=>{
  	console.log(`Worker ${process.pid} started, listening on port 8443`);
  }); 
} 
