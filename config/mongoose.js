/********************************************************/
/*					MONGOOSE.JS (DATABASE)				*/
/********************************************************/


// This is a config file that connects to MongoDB and loads the models.

var mongoose = require('mongoose');
//  file-system to load, read, require all of the model files
var fs = require('fs');
// connect to  database
mongoose.connect('mongodb://localhost/MiniStore');
// specify  path to all of the models
var models_path = __dirname + '/../server/models'
// read all of the files in the models_path 
fs.readdirSync(models_path).forEach(function(file) {
  if(file.indexOf('.js') > 0) {
    require(models_path + '/' + file);
  }
})