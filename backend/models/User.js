const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        pin: { type: String, required: true }, // For simplicity; in production hash this
        balance: { type: Number, required: true, default: 1000 },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('User', userSchema);


