/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var FieldSchema = new mongoose.Schema({
  name: {type: String, default: ""},
  type: {type: String, default: "short"},
  private: {type: Boolean, default: false},
  req: {type: Boolean, default: false},
  default: {type: {} },
  date: { type : Date, default: Date.now }
});

mongoose.model('Field', FieldSchema);
