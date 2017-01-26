/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CustomerSchema = new mongoose.Schema({
  name: String,
  date: { type : Date, default: Date.now },    
  orders: [{type: Schema.Types.ObjectId, ref:'Order'}],
  active: String
}); 

mongoose.model('Customer', CustomerSchema);
