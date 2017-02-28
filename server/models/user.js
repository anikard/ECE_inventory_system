/********************************************************/
/*							MODEL						*/
/********************************************************/

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = 'D6MDhL3A3FQyaCwEY0JH';

var Schema = mongoose.Schema;
var UserSchema = new mongoose.Schema({
  username: {type: String, default: "", index: true, unique: true},
  name: {type: String, default: "", index: true},
  netId: {type: String, default: "", index: true},
  date: { type : Date, default: Date.now },
  salt: {type: String, default: ""},
  email: {type: String, default: ""},
  status: {type: String, default: ""},
  hash: {type: String, default: ""},
  active: {type: Boolean, default: true},
  apiKey: {type: String, default: ""},
  //orders: [{type: Schema.Types.ObjectId, ref:'Order'}],
  //active: String
}); 

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  return jwt.sign({
    _id: this._id,
    username: this.username,
    name: this.name,
    netId: this.netId,
    status: this.status,
  }, secret, { expiresIn: '7d' });
};

UserSchema.methods.generateApiKey = function() {
  if (this.apiKey) return this.apiKey;
  this.apiKey = crypto.randomBytes(64).toString('hex');
  return this.apiKey;
};

UserSchema.methods.revokeApiKey = function() {
  this.apiKey = "";
};


mongoose.model('User', UserSchema);
