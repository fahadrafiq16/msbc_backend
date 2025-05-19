// FetchPayments.js
const express = require('express');
const router = express.Router();
const { createMollieClient } = require('@mollie/api-client');
const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

// Route to fetch all payment records and log them
router.get('/fetch-payments', async (req, res) => {
    try {
        // Fetch all payments
        const payments = await mollieClient.payments.all();

        // Log the payments to the console
        //console.log('All Payments:', payments);

        // Send response
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

module.exports = router;
