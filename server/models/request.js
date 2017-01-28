/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var RequestSchema = new mongoose.Schema({
  userId: {type:Schema.ObjectId, ref:'User'},
  itemId: {type:Schema.ObjectId, ref:'Item'},
  quantity: Number,
  reason: String,
  note: String,
  status: String,
  date: { type : Date, default: Date.now }   
});

mongoose.model('Request', RequestSchema);
