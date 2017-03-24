/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
  name: {type: String, required: true, index: true, unique: true },
  quantity: {type: Number, default: 0},
  quantity_available: {type: Number, default: 0},
  location: {type: String, defalut: ""},
  model: {type: String, default: ""},
  description: {type: String, default: ""},
  fields: {type: {}},
  tags: [String],
  image: {type: String, default: ""},
  custom_fields: {}

});

mongoose.model('Item', ItemSchema);
