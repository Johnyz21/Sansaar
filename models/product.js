const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
  imagePath: {type: String, required: true},
  title: {type: String, required: true},
  description: {type: String, required: true},
  price: {type: Number, required: true},
  disabled : {
    type: Boolean,
    required: true,
    default : false
  }
  // request: { type: Boolean, required: true}
});

module.exports = mongoose.model('Product', productSchema);
