/**
 * Created by Efe Aras on 4/1/2017.
 */
/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
//var mailer = require('../controllers/mailer.js');

var AssetSchema = new mongoose.Schema({
    assetTag: {type: String, default: "", unique: true},
    custom_fields: {}
});

mongoose.model('Asset', AssetSchema);
