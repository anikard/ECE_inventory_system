/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
  name: {type: String, default: ""},
  description: {type: String, default: ""},
  quantity: {type: Number, default: 0},
  model: {type: String, default: ""},
  location: {type: String, default: ""},
  tags: [String],
  image: {type: String, default: ""},
  custom_fields: {}

});

mongoose.model('Item', ItemSchema);
