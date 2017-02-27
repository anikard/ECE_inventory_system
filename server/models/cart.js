/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CartSchema = new mongoose.Schema({
  user: {type:Schema.ObjectId, ref:'User', required: true},
  items: [{
  	item: {type:Schema.ObjectId, ref:'Item'},
  	quantity: {type: Number, default: 0}
  }]

});

mongoose.model('Cart', CartSchema);