const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get current balance
async function getBalance(req, res) {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({ balance: user.balance });
    } catch (err) {
        console.error('Get balance error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// Make a transfer or bill payment (now supports peer transfers and billers)
async function makeTransfer(req, res) {
    try {
        const { userId, type, amount, recipientName, merchant, note } = req.body;
        if (!userId || !type || !amount) {
            return res.status(400).json({ message: 'userId, type, and amount are required' });
        }
        if (!['transfer', 'bill'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type' });
        }
        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.balance < numericAmount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Debit sender
        user.balance -= numericAmount;
        await user.save();

        let debitRecord;
        let creditRecord;
        if (type === 'transfer' && recipientName) {
            const recipient = await User.findOne({ name: recipientName.trim() });
            if (!recipient) {
                return res.status(400).json({ message: 'Recipient not found' });
            }
            recipient.balance += numericAmount;
            await recipient.save();

            debitRecord = await Transaction.create({ userId: user._id, type: 'transfer', amount: numericAmount, toUserId: recipient._id, note });
            creditRecord = await Transaction.create({ userId: recipient._id, type: 'credit', amount: numericAmount, toUserId: user._id, note: `from ${user.name}` });
        } else if (type === 'bill') {
            debitRecord = await Transaction.create({ userId: user._id, type: 'bill', amount: numericAmount, merchant: merchant || 'Biller', note });
        } else {
            // Backward compatibility: simple transfer without a specified recipient
            debitRecord = await Transaction.create({ userId: user._id, type, amount: numericAmount, note });
        }

        return res.status(201).json({
            message: 'Transaction successful',
            receipt: {
                transactionId: debitRecord._id,
                userId: user._id,
                type: debitRecord.type,
                amount: debitRecord.amount,
                date: debitRecord.date,
                balanceAfter: user.balance,
                recipientCredited: creditRecord ? { id: creditRecord.userId, amount: creditRecord.amount } : null,
                merchant: debitRecord.merchant || null,
                note: debitRecord.note || null,
            },
        });
    } catch (err) {
        console.error('Transfer error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// Get last 5 transactions
async function getMiniStatement(req, res) {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(5);
        return res.json({ transactions });
    } catch (err) {
        console.error('Statement error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getBalance, makeTransfer, getMiniStatement };


