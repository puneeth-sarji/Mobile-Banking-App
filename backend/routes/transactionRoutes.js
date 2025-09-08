const express = require('express');
const router = express.Router();
const {
    getBalance,
    makeTransfer,
    getMiniStatement,
} = require('../controllers/transactionController');

// GET /api/transactions/balance/:userId
router.get('/balance/:userId', getBalance);

// POST /api/transactions/transfer
router.post('/transfer', makeTransfer);

// GET /api/transactions/statement/:userId
router.get('/statement/:userId', getMiniStatement);

module.exports = router;


