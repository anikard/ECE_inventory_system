/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  quantity: Number, 
  model: String,
  location: String, 
  tags: [String],
  image: String
});

mongoose.model('Item', ItemSchema);