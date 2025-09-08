const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['transfer', 'bill', 'credit'], required: true },
        amount: { type: Number, required: true, min: 1 },
        date: { type: Date, default: Date.now },
        toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        merchant: { type: String },
        note: { type: String },
    },
    { timestamps: false }
);

module.exports = mongoose.model('Transaction', transactionSchema);


