const mongoose = require('mongoose');

// ============================================================================
// ORDER MODEL
// Created the moment the frontend hits "Proceed to Payment" (before VNPay
// is even involved), so there's always a record of what was attempted — and
// updated once VNPay's IPN/return callback confirms success or failure.
// ============================================================================
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },   // snapshot at time of order, in case the product changes/is deleted later
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    txnRef: { type: String, required: true, unique: true, index: true }, // sent to VNPay as vnp_TxnRef
    items: { type: [orderItemSchema], required: true },
    amount: { type: Number, required: true }, // total, VND
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    vnpResponseCode: { type: String, default: null }, // VNPay's vnp_ResponseCode once known
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional — set if the buyer is logged in
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);