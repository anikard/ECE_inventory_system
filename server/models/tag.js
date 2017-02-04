/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var TagSchema = new mongoose.Schema({
  name: {type: String, default: ""},
  date: { type : Date, default: Date.now }   
});

mongoose.model('Tag', TagSchema);
