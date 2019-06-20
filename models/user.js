const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

var userSchema = new Schema({
  email: {type: String, required: true},
  password : {type:String, required: true},
  admin : {type: Boolean, required: true, default: false},
  disabled : {type: Boolean, required: true, default : false},
  resetPasswordToken: {type: String},
  resetPasswordExpires: {type: String}

});
userSchema.methods.encryptPassword = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', userSchema);
