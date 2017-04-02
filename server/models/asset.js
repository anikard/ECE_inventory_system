/**
 * Created by Efe Aras on 4/1/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AssetSchema = new mongoose.Schema({
    assetTag: {type: String, default: ""}

});

mongoose.model('Asset', AssetSchema);