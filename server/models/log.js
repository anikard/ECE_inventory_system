/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var LogSchema = new mongoose.Schema({
  user: {type:Schema.ObjectId, ref:'User', required: true},
  item: {type:Schema.ObjectId, ref:'Item', required: true},
  action: {type: String, default: ""},
  affected: {type:Schema.ObjectId, ref:'User'},
  date: { type : Date, default: Date.now }   
});

mongoose.model('Log', LogSchema);
