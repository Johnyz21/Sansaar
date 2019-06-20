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
  phoneNumber : {type: Number, required: true},
  mobileNumber: {type: Number, required: true},
  faxNumber: {type: Number},
  email: {type: String, required: true},
  emergencyContactName: {type: String, required: true},
  emergencyContactRelationship: {type: String, required: true},
  emergencyContactPhone: {type: String, required: true},
  emergencyContactEmail: {type: String, required: true},
  travelIndependently: {type: Boolean, required: true},
  dietaryRestrictions: {type: String},
  refundPolicy: {type: Boolean, required : true},
  approveHealthAssessment : {type: Boolean, required: true},
  maritalStatus: {type: String, enum: ['Single','Partnered','Married','Separated','Divorced','Widowed']},
  physicianName : {type: String, required: true},
  physicianEmail : {type: String, required: true},
  dateOfLastPhysicalExam: {type: Date, required: true},
  measelsAsAChild: { type: Boolean, required: true },
  mumpsAsAChild: { type: Boolean, required: true },
  rubellaAsAChild: { type: Boolean, required: true },
  chickenpoxAsAChild: { type: Boolean, required: true },
  rheumaticFeverAsAChild: { type: Boolean, required: true },
  polioAsAChild: { type: Boolean, required: true },
  submissionDate : { type:Date, default: Date.now},
  tetnus: { type:Date},
  typhoid: { type:Date, default: Date.now},
  hepatitusA: { type:Date, default: Date.now},
  hepatitusB: { type:Date, default: Date.now},
  yellowFever: { type:Date, default: Date.now},
  surgeries: [{}],
  otherHospitalisations: [{}],
  medication: [{}],
  allergyToMedication: [{}]

  // request: { type: Boolean, required: true}
});

module.exports = mongoose.model('EventRegistrationDetails', eventRegistrationSchema);
