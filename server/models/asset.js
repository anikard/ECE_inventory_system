/**
 * Created by Efe Aras on 4/1/2017.
 */
/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AssetSchema = new Schema({
  assetTag: {type: String, unique: true, required: true},
  item: {type: Schema.ObjectId, ref:'Item', required: true, autopopulate: true},
  fields: {},
}, { timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'} });
AssetSchema.plugin(require('mongoose-autopopulate'));

mongoose.model('Asset', AssetSchema);
