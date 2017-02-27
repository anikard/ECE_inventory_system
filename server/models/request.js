/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var RequestSchema = new mongoose.Schema({
  user: {type:Schema.ObjectId, ref:'User', required: true, index: true},
  items: [{
  	item: {type:Schema.ObjectId, ref:'Item'},
  	quantity: {type: Number, default: 0}
  }],
  reason: {type: String, default: ""},
  note: {type: String, default:""},
  status: {type: String, default:"open"},
  date: { type : Date, default: Date.now },
  dateFulfilled: { type : Date, default: null},

});

mongoose.model('Request', RequestSchema);
