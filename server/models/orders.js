/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var OrderSchema = new mongoose.Schema({
  _customer: {type:Schema.ObjectId, ref:'Customer'},
  customer_name: String,
  product: String,
  quantity: Number,
  date: { type : Date, default: Date.now }   
});

mongoose.model('Order', OrderSchema);
