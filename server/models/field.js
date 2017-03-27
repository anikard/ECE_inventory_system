/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var FieldSchema = new mongoose.Schema({
  name: {type: String, required: true, index: true, unique: true},
  type: {type: String, default: "short-form"},
  access: {type: String, default: "public"},
  req: {type: Boolean, default: false},
  default: {type: {} },
  date: { type : Date, default: Date.now }
});

mongoose.model('Field', FieldSchema);
