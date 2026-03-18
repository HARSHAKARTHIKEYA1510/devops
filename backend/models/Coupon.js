const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: Number,
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    expiresAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
