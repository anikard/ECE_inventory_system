/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ItemSchema = new Schema({
  name: {type: String, required: true, index: true, unique: true },
  quantity: {type: Number, default: 0},
  quantity_available: {type: Number, default: 0},
  min_quantity: {type: Number, default: 0},
  last_check_date: {type: Date, default: Date.now() - 25 * 3600 * 1000 },
  model: {type: String, default: ""},
  description: {type: String, default: ""},
  fields: {type: {}},
  tags: [String],
  image: {type: String, default: ""},
  isAsset: {type: Boolean, default: false},
  assets: [{type:Schema.ObjectId, ref:'Asset'}]
}, { timestamps: { createdAt: 'createdAt',  updatedAt: 'updatedAt'} });
ItemSchema.plugin(require('mongoose-autopopulate'));

mongoose.model('Item', ItemSchema);
