const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {type:String},
  orderNumber: {
    type: String,
    required: true,
    
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products', // Reference to the actual collection name
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price:{
        type:Number,
        required:true
      }
    }
  ],
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the actual collection name
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled','closed'],
    default: 'pending'
  },
  payment: {
    type: String
  },
  address: [{
    name: String,
    house: String,
    post: Number,
    city: String,
    state: String,
    district: String,
    contact: Number
  }],
});

module.exports = mongoose.model('Order', orderSchema);
