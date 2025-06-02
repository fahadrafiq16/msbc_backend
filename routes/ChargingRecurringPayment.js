const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');

const router = express.Router();



const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

router.post('/create-subscription', async (req, res) => {
    const { customerId, userInfo } = req.body;

    if (!customerId || !userInfo) {
        return res.status(400).json({ error: 'Customer ID and user information are required' });
    }

    try {
        const baseAmount = parseFloat(userInfo.selectedOption.amount); // Base recurring amount (e.g., $540)
        const extraAmount = parseFloat(userInfo.extraOption.amount || 0); // Extra amount (e.g., $300 if selected)
        const firstMonthAmount = baseAmount + (extraAmount === 300 ? extraAmount : 0); // Add extra amount only for the first payment
        const recurringAmount = baseAmount; // Fixed amount for subsequent months

        let firstSubscription = null;
        let recurringSubscription = null;
        console.log('Webhook URL:', 'https://msbc-backend.vercel.app/api/subscription-webhook');
        if (extraAmount !== 0) {
            // Step 1: First payment with the extra option (if applicable)
            firstSubscription = await mollieClient.customers_subscriptions.create({
                customerId,
                amount: {
                    value: extraAmount.toFixed(2), // First payment amount (e.g., $840 if extra is selected)
                    currency: 'EUR',
                },
                interval: '12 months',
                times: 1, // Only for the first payment
                description: 'Payment for Extra Meal',
                webhookUrl: 'https://msbc-backend.vercel.app/api/subscription-webhook',
            });
        }


        // Step 2: Recurring payments without the extra option (this will always run)
        recurringSubscription = await mollieClient.customers_subscriptions.create({
            customerId,
            amount: {
                value: recurringAmount.toFixed(2), // Subsequent payments amount (e.g., $540)
                currency: 'EUR',
            },
            interval: '1 day', // Set to '1 month' for monthly payments
            times: userInfo.selectedOption.quantity, // Set to the number of recurring payments
            
            description: 'Recurring subscription payment',
            webhookUrl: 'https://msbc-backend.vercel.app/api/subscription-webhook',
        });

        res.status(200).json({
            firstSubscription,
            recurringSubscription,
        });
    } catch (error) {
        console.error('Error creating subscriptions:', error);
        res.status(500).json({ error: 'Failed to create subscriptions' });
    }
});


module.exports = router;
