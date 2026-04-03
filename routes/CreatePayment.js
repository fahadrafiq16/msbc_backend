const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');
require('dotenv').config(); // Load .env at the top

const router = express.Router();

const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

// Mollie create payment For Non-Recurring Payments
router.post('/create-payment', async (req, res) => {
    const { amount, userInfo } = req.body;

    const amountNum = parseFloat(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return res.status(400).json({
            error: 'Invalid amount',
            message: 'Amount must be a positive number.',
        });
    }
    const amountStr = amountNum.toFixed(2);

    try {
        const payment = await mollieClient.payments.create({
            amount: {
                value: amount, // Amount in the selected currency
                currency: 'EUR',
            },
            description: `Payment for 123 ${userInfo.voornaam}`,
            redirectUrl: `https://magnificent-horse-a4affe.netlify.app/mollie-redirect?name=${encodeURIComponent(userInfo.voornaam)}&email=${encodeURIComponent(userInfo.email)}&selectedOption=${encodeURIComponent(userInfo.selectedOption.title)}&subTitle=${encodeURIComponent(userInfo.selectedOption.subTitle)}`,
            webhookUrl: `${process.env.BASE_BACKEND_URL}/api/payment-webhook`,
            metadata: {
                userInfo,
            },
        });

        res.json({ paymentUrl: payment.links.checkout.href });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

module.exports = router;
