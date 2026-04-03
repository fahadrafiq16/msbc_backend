const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');
require('dotenv').config(); // Load .env at the top
const UserInfo = require('../models/UserInfo');

const router = express.Router();



const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

async function listSubscriptions(customerId) {
    try {
        const list = await mollieClient.customers_subscriptions.list({ customerId });
        return list?._embedded?.subscriptions ?? list?.subscriptions ?? [];
    } catch {
        return [];
    }
}

async function createOrReuseSubscription({ customerId, payload }) {
    try {
        return await mollieClient.customers_subscriptions.create({ customerId, ...payload });
    } catch (error) {
        // Mollie duplicate description: treat as success and reuse existing
        if (error?.statusCode === 422 && error?.field === 'description') {
            const existing = await listSubscriptions(customerId);
            const reused = existing.find((s) => s.description === payload.description);
            if (reused) return reused;
        }
        throw error;
    }
}

// Check if same voornaam + email already has a paid recurring registration
router.post('/check-recurring-eligibility', async (req, res) => {
    try {
        const email = String(req.body?.email || "").trim().toLowerCase();
        const voornaam = String(req.body?.voornaam || "").trim().toLowerCase();
        if (!email || !voornaam) {
            return res.status(400).json({ eligible: false, reason: 'email and voornaam are required' });
        }

        const existing = await UserInfo.findOne({
            email,
            voornaam,
            status: 'paid',
            'selectedOption.recurring': true,
        }).sort({ createdAt: -1 });

        if (existing) {
            return res.status(200).json({
                eligible: false,
                reason: 'already_registered',
                message: 'Deze combinatie van voornaam en e-mailadres heeft al een actief terugkerend abonnement.',
            });
        }

        return res.status(200).json({ eligible: true });
    } catch (error) {
        return res.status(500).json({ eligible: false, reason: 'server_error', message: error?.message || 'Server error' });
    }
});

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
        console.log('Webhook URL:', `${process.env.BASE_BACKEND_URL}/api/subscription-webhook`);

        // Idempotency: reuse existing subscriptions (prevents 422 duplicate description)
        let existing = await listSubscriptions(customerId);

        if (extraAmount !== 0) {
            // Step 1: First payment with the extra option (if applicable)
            const firstDesc = `Extra: ${String(userInfo?.extraOption?.title || "Extra Meal")}`;
            firstSubscription =
                existing.find((s) => s.description === firstDesc) ||
                (await createOrReuseSubscription({
                    customerId,
                    payload: {
                    amount: {
                        value: extraAmount.toFixed(2),
                        currency: 'EUR',
                    },
                    interval: '12 months',
                    times: 1,
                    description: firstDesc,
                    webhookUrl: `${process.env.BASE_BACKEND_URL}/api/subscription-webhook`,
                }}));
        }


        // Step 2: Recurring payments without the extra option (this will always run)
        const recurringDesc = `Recurring: ${String(userInfo?.selectedOption?.trainingTitle || "subscription")}`;
        recurringSubscription =
            existing.find((s) => s.description === recurringDesc) ||
            (await createOrReuseSubscription({
                customerId,
                payload: {
                amount: {
                    value: recurringAmount.toFixed(2),
                    currency: 'EUR',
                },
                interval: '1 day', // TODO: change to '1 month' when ready
                times: userInfo.selectedOption.quantity,
                description: recurringDesc,
                webhookUrl: `${process.env.BASE_BACKEND_URL}/api/subscription-webhook`,
            }}));

        res.status(200).json({
            firstSubscription,
            recurringSubscription,
        });
    } catch (error) {
        console.error('Error creating subscriptions:', error);
        res.status(500).json({ error: error?.message || 'Failed to create subscriptions' });
    }
});


module.exports = router;
