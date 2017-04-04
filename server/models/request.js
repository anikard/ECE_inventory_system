/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var RequestSchema = new mongoose.Schema({
  user: {type:Schema.ObjectId, ref:'User', required: true, index: true, autopopulate: true},
  items: [{
  	item: {type:Schema.ObjectId, ref:'Item', autopopulate: true},
  	quantity: {type: Number, default: 0}
  }],
  reason: {type: String, default: ""},
  note: {type: String, default:""},
  status: {type: String, default:"outstanding", enum: ['outstanding', 'onLoan', 'disbursed', 'returned', 'closed', 'approved', 'converted']},
  type: {type: String, default:"disburse"},
  date: { type : Date, default: Date.now },
  dateFulfilled: { type : Date, default: null},

});
RequestSchema.plugin(require('mongoose-autopopulate'));

mongoose.model('Request', RequestSchema);
