const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventRegistrationSchema = new Schema({
  firstName: {type: String, required: true},
  middleName: {type: String},
  surname: {type: String, required: true},
  dob: {type: Date, required: true},
  gender: {type: String,enum: ['Male','Female','Other'], required: true},
  passportNumber: {type: Number, required: true},
  passportExpiry: {type: Date, required: true},
  mobileNumber: {type: Number, required: true},
  faxNumber: {type: Number},
  email: {type: String, required: true},
  emergencyContactName: {type: String, required: true},
  emergencyContactRelationship: {type: String, required: true},
  emergencyContactPhone: {type: String, required: true},
  emergencyContactEmail: {type: String, required: true},
  travelIndependently: {type: Boolean, required: true},
  dietaryRestrictions: {type: String}
  // request: { type: Boolean, required: true}
});

module.exports = mongoose.model('EventRegistrationDetails', eventRegistrationSchema);
