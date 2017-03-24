/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');

var EmailSchema = new mongoose.Schema({
  subjectTag: {type: String, defalut: ""},
  subject: {type: String, default: ""},
  body: {type: String, default: ""},
  send_dates: [String]
});

mongoose.model('Email', EmailSchema);