/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  num_left: Number,
  image_url: String
});

mongoose.model('Product', ProductSchema);