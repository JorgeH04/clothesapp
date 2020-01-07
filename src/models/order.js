const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User'},
    
  cart: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  talle: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Order', OrderSchema);
