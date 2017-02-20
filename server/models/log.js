/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var LogSchema = new mongoose.Schema({
  init_user: {type:Schema.ObjectId, ref:'User', required: true},
  item: {type:Schema.ObjectId, ref:'Item', required: true},
  event: {type: String, default: ""},
  rec_user: {type:Schema.ObjectId, ref:'User'},
  date: { type : Date, default: Date.now },
  admin_actions {type: String, default: ""}  
});

mongoose.model('Log', LogSchema);


     //      init_user: String, 
     //      items: Array of Strings, 
