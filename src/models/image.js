const mongoose = require('mongoose');
const { Schema } = mongoose;
const path = require('path');

const ImageSchema = new Schema({
    filename: { type: String },
    product: {
      type: String,
      required: true
    },
     price: {
      type: Number,
      required: true
    },
    timestamp: { type: Date, default: Date.now }
  
});

ImageSchema.virtual('uniqueId')
  .get(function () {
    return this.filename.replace(path.extname(this.filename), '');
  });

module.exports = mongoose.model('Image', ImageSchema);