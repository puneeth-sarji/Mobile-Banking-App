const User = require('../models/User');

// Signup: create a user with name and pin
async function signup(req, res) {
    try {
        const { name, pin } = req.body;
        if (!name || !pin) {
            return res.status(400).json({ message: 'Name and PIN are required' });
        }

        // Check if user exists by name
        const existing = await User.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name: name.trim(), pin: String(pin), balance: 1000 });
        return res.status(201).json({
            message: 'Signup successful',
            user: { id: user._id, name: user.name, balance: user.balance },
        });
    } catch (err) {
        console.error('Signup error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// Login: validate name and pin
async function login(req, res) {
    try {
        const { name, pin } = req.body;
        if (!name || !pin) {
            return res.status(400).json({ message: 'Name and PIN are required' });
        }
        const user = await User.findOne({ name: name.trim(), pin: String(pin) });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        return res.json({ message: 'Login successful', user: { id: user._id, name: user.name, balance: user.balance } });
    } catch (err) {
        console.error('Login error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { signup, login };


