/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new mongoose.Schema({
  name: {type: String, default: ""},
  netId: {type: String, default: ""},
  date: { type : Date, default: Date.now },
  password: {type: String, default: ""},
  salt: {type: String, default: ""},
  email: {type: String, default: ""},
  status: {type: String, default: ""},

  //orders: [{type: Schema.Types.ObjectId, ref:'Order'}],
  //active: String
}); 

mongoose.model('User', UserSchema);
