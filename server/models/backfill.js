/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BackfillSchema = new Schema({
  request: {type:Schema.ObjectId, ref:'Request', required: true, autopopulate: true},
  items: [{
  	item: {type:Schema.ObjectId, ref:'Item', autopopulate: true},
  	quantity: {type: Number, default: 0}
  }],
  pdf: { type : String, default: ""},
  status: {type: String, default:"requested", enum: ['requested', 'inTransit', 'denied', 'fulfilled', 'closed']},
  date: { type : Date, default: Date.now },
}, { timestamps: { createdAt: 'createdAt',  updatedAt: 'updatedAt'} });
BackfillSchema.plugin(require('mongoose-autopopulate'));

BackfillSchema.statics.findByRequest = (req, cb) => {
  return this.find({request: req}, cb);
}

mongoose.model('Backfill', BackfillSchema);
