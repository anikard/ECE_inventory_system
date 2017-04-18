/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BackfillSchema = new Schema({
  request: {type:Schema.ObjectId, ref:'Request'},
  items: [{
  	item: {type:Schema.ObjectId, ref:'Item'},
    quantity: {type: Number, default: 0}
  	//quantity_outstanding_request: {type: Number, default: 0},
    //quantity_loan_request: {type: Number, default: 0},
    //quantity_transit_outstanding: {type: Number, default: 0},
    //quantity_transit_loan: {type: Number, default: 0},
    //quantity_deny: {type: Number, default: 0},
    //quantity_fulfilled: {type: Number, default: 0},
    //quantity_failed: {type: Number, default: 0}
  }],
  pdf: { type : String, default: ""},
  status: {type: String, default:"requested", enum: ['requested', 'inTransit', 'denied', 'failed', 'fulfilled', 'closed']},
  origin: {type: String, default:"outstanding", enum: ['outstanding', 'loan']},
  date: { type : Date, default: Date.now },
}, { timestamps: { createdAt: 'createdAt',  updatedAt: 'updatedAt'} });
BackfillSchema.plugin(require('mongoose-autopopulate'));

BackfillSchema.statics.findByRequest = (req, cb) => {
  return this.find({request: req}, cb);
}

mongoose.model('Backfill', BackfillSchema);
