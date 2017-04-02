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
  status: {type: String, default:"requested", enum: ['requested', 'inTransit', 'denied', 'done', 'closed']},
  date: { type : Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'} });
BackfillSchema.plugin(require('mongoose-autopopulate'));

mongoose.model('Request', RequestSchema);
