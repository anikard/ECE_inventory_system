/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var LogSchema = new mongoose.Schema({
  userId: {type:Schema.ObjectId, ref:'User'},
  action: {type: String, default: ""},
  note: {type: String, default: ""},
  date: { type : Date, default: Date.now }   
});

mongoose.model('Log', LogSchema);
