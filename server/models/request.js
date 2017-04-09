/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var RequestSchema = new mongoose.Schema({
  user: {type:Schema.ObjectId, ref:'User', required: true, index: true, autopopulate: true},
  reason: {type: String, default: ""},
  items: [{
  	item: {type:Schema.ObjectId, ref:'Item', autopopulate: true},
    quantity_requested: {type: Number, default:0},
    quantity_disburse: {type: Number, default: 0},
    quantity_loan: {type: Number, default: 0},
    quantity_deny: {type: Number, default: 0},
    quantity_return: {type: Number, default: 0},
    quantity_backfill: {type: Number, default: 0},
    type: {type: String, default:"disburse"}
  }],

  notes: [{type: String, default:""}],
  //status: {type: String, default:"outstanding", enum: ['outstanding', 'onLoan', 'disbursed', 'returned', 'closed', 'approved', 'converted', 'denied']},
  date: { type : Date, default: Date.now },
  dateUpdated: { type : Date, default: Date.now},

});
RequestSchema.plugin(require('mongoose-autopopulate'));

mongoose.model('Request', RequestSchema);
