/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new mongoose.Schema({
  name: String,
  netId: String,
  date: { type : Date, default: Date.now },
  password: String,
  salt: String,
  email: String,
  status: String,

  //orders: [{type: Schema.Types.ObjectId, ref:'Order'}],
  //active: String
}); 

mongoose.model('User', UserSchema);
