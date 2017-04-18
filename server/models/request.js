/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var RequestSchema = new mongoose.Schema({
  user: {type:Schema.ObjectId, ref:'User', required: true, index: true, autopopulate: true},
  reason: {type: String, default: ""},
  items: [{
    // REQUIRED TO CREATE REQUEST
  	item: {type:Schema.ObjectId, ref:'Item', autopopulate: true},
    quantity_requested: {type: Number, default: 0},

    // AUTO-POPULATED BY BACKEND
    quantity_disburse: {type: Number, default: 0},
    quantity_loan: {type: Number, default: 0},
    quantity_deny: {type: Number, default: 0},
    quantity_return: {type: Number, default: 0},
    quantity_backfill: {type: Number, default: 0},

    // MANUALLY INPUT
    quantity_cancel: {type: Number, default: 0},

    // MANUALLY INPUT ON UPDATE
    quantity_outstanding_disburse: {type: Number, default: 0},
    quantity_outstanding_loan: {type: Number, default: 0},
    quantity_outstanding_deny: {type: Number, default:0},
    quantity_outstanding_backfill: {type: Number, default: 0},

    // MANUALLY INPUT ON UPDATE
    quantity_loan_disburse: {type: Number, default: 0},
    quantity_loan_return: {type: Number, default: 0},
    quantity_loan_backfill: {type: Number, default: 0}
  }],
  assets:[{
    item: {type:Schema.ObjectId, ref:'Item', autopopulate: true},
    assetTag: {type: String, default: ""},
    status: {type: String, default:"outstanding", enum: ['outstanding', 'onLoan', 'disbursed', 'returned', 'closed', 'denied', 'backfill-requested', 'backfill-transit', 'backfill-denied', 'backfill-fulfilled', 'backfill-failed']}
  }],
  backfills:[{type:Schema.ObjectId, ref:'Backfill', autopopulate: true}],
  notes: [{type: String, default: ""}],
  //status: {type: String, default:"outstanding", enum: ['outstanding', 'onLoan', 'disbursed', 'returned', 'closed', 'approved', 'converted', 'denied']},
  type: {type: String, default: "disburse", enum: ['disburse', 'loan', 'backfill']},
  date: { type : Date, default: Date.now },
  dateUpdated: { type : Date, default: Date.now},

});
RequestSchema.plugin(require('mongoose-autopopulate'));

mongoose.model('Request', RequestSchema);
