const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');

const router = express.Router();

const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

require('dotenv').config();
const BASE_FRONTEND_URL = process.env.BASE_FRONTEND_URL;
const BASE_BACKEND_URL = process.env.BASE_BACKEND_URL;
// Mollie create payment For Non-Recurring Payments
router.post('/create-payment', async (req, res) => {
    const { amount, userInfo } = req.body;

    try {
        const payment = await mollieClient.payments.create({
            amount: {
                value: amount, // Amount in the selected currency
                currency: 'EUR', // Change this if needed
            },
            description: `Payment for ${userInfo.voornaam}`, // Description for the payment
            redirectUrl: `https://magnificent-horse-a4affe.netlify.app/mollie-redirect?name=${encodeURIComponent(userInfo.voornaam)}&email=${encodeURIComponent(userInfo.email)}&selectedOption=${encodeURIComponent(userInfo.selectedOption.title)}&subTitle=${encodeURIComponent(userInfo.selectedOption.subTitle)}`,
            webhookUrl: `${BASE_BACKEND_URL}/api/payment-webhook`, // Webhook URL to handle payment updates
            metadata: {
                userInfo, // Additional user info you want to track
            },
        });

        res.json({ paymentUrl: payment.links.checkout.href });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

module.exports = router;