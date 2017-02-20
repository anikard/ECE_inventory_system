/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
  name: {type: String, required: true, index: true, unique: true },
  quantity: {type: Number, default: 0}, 
  model: {type: String, default: ""},
  description: {type: String, default: ""},
  fields: {type: {}}, 
  tags: [String],
  image: {type: String, default: ""}

});

mongoose.model('Item', ItemSchema);