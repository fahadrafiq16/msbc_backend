const express = require('express');
const getMollieClient = require("../utils/mollieClient");
const cors = require('cors');
require('dotenv').config(); // Load .env at the top

const router = express.Router();


const baseFrontendUrl = () =>
    String(process.env.BASE_FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

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
        const payment = await getMollieClient().payments.create({
            amount: {
                value: amountStr, // Amount in the selected currency
                currency: 'EUR',
            },
            description: `Payment for 123 ${userInfo.voornaam}`,
            redirectUrl: `${baseFrontendUrl()}/mollie-redirect?name=${encodeURIComponent(userInfo.voornaam)}&email=${encodeURIComponent(userInfo.email)}&selectedOption=${encodeURIComponent(userInfo.selectedOption.title)}&subTitle=${encodeURIComponent(userInfo.selectedOption.subTitle)}`,
            webhookUrl: `${process.env.BASE_BACKEND_URL}/api/payment-webhook`,
            metadata: {
                userInfo,
            },
        });

        res.json({ paymentUrl: payment.getCheckoutUrl() });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(error.code === 'PAYMENT_NOT_CONFIGURED' ? 503 : 502).json({
            error: error.code === 'PAYMENT_NOT_CONFIGURED' ? error.message : 'Payment could not be started. Please try again or contact the club.',
            code: error.code === 'PAYMENT_NOT_CONFIGURED' ? error.code : 'PAYMENT_FAILED',
        });
    }
});

module.exports = router;
