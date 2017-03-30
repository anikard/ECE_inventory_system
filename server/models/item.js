/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
//var mailer = require('../controllers/mailer.js');

var ItemSchema = new mongoose.Schema({
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
  custom_fields: {},

}, { timestamps: { createdAt: 'created_at',  updatedAt: 'updated_at'} });

mongoose.model('Item', ItemSchema);
