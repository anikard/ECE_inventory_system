/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CartSchema = new mongoose.Schema({
  user: {type:Schema.ObjectId, ref:'User', required: true},
  items: {type: {}}, 

});

mongoose.model('Cart', CartSchema);