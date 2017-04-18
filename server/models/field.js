/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var FieldSchema = new mongoose.Schema({
  name: {type: String, required: true, index: true, unique: true},
  type: {type: String, default: "short-form", enum: ['short-form', 'long-form', 'integer', 'floating-point']},
  access: {type: String, default: "public", enum: ['public', 'private']},
  req: {type: Boolean, default: false},
  default: {type: {} },
  date: { type : Date, default: Date.now },
  perAsset: {type: String, default: "general", enum: ['per-asset', 'general']},
});

mongoose.model('Field', FieldSchema);
