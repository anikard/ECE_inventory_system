/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var LogSchema = new mongoose.Schema({
  init_user: {type:Schema.ObjectId, ref:'User', required: true, index: true},
  item: [{type:Schema.ObjectId, ref:'Item'}],
  quantity: [{type: Number}],
  request: {type:Schema.ObjectId, ref:'Request'},
  event: {type: String, default: ""},
  rec_user: {type:Schema.ObjectId, ref:'User'},
  admin_actions: {type: String, default: ""},  
  name_list: [{type: String}]
}, { timestamps: { createdAt: 'date'} });

mongoose.model('Log', LogSchema);

