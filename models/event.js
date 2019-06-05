const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({

  applied: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  verified: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  attending: [{
    type: Schema.Types.ObjectId,
    ref: 'EventRegistrationDetails'
  }],
  imagePath: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  participants: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  disabled : {
    type: Boolean,
    required: true,
    default : false
  }
});


module.exports = mongoose.model('Event', eventSchema);
