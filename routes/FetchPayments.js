// FetchPayments.js
const express = require('express');
const router = express.Router();
const { createMollieClient } = require('@mollie/api-client');
const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

function normalizeList(result) {
    const list = Array.isArray(result)
        ? result
        : (result?._embedded?.payments ?? result?.payments ?? result?.data ?? []);
    return Array.isArray(list) ? list : [];
}

// Route to fetch all payment records from Mollie (paginated)
router.get('/fetch-payments', async (req, res) => {
    try {
        const requestedLimit = Number(req.query?.limit || 250);
        const pageSize = Math.min(Math.max(requestedLimit, 1), 250);
        const maxRecords = Number(req.query?.max || 10000);
        const yearRaw = String(req.query?.year || '').trim();
        const filterYear = /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;
        const monthRaw = String(req.query?.month || '').trim().toLowerCase();
        const filterMonth = /^\d{1,2}$/.test(monthRaw) ? Number(monthRaw) : null; // 1-12

        const allPayments = [];
        let from = undefined;
        let safety = 0;

        while (allPayments.length < maxRecords && safety < 1000) {
            safety += 1;
            const result = await mollieClient.payments.page({
                limit: pageSize,
                ...(from ? { from } : {}),
            });
            const pageItems = normalizeList(result);
            if (pageItems.length === 0) break;

            allPayments.push(...pageItems);

            const last = pageItems[pageItems.length - 1];
            const nextFrom = last?.id;
            if (!nextFrom || pageItems.length < pageSize || nextFrom === from) break;
            from = nextFrom;
        }

        // Ensure newest first
        const sorted = allPayments.sort((a, b) => {
            const da = new Date(a?.paidAt || a?.createdAt || 0).getTime();
            const db = new Date(b?.paidAt || b?.createdAt || 0).getTime();
            return db - da;
        });

        const filtered = filterYear
            ? sorted.filter((p) => {
                const d = new Date(p?.paidAt || p?.createdAt || 0);
                return !Number.isNaN(d.getTime()) && d.getUTCFullYear() === filterYear;
            })
            : sorted;

        const filteredByMonth = filterMonth && filterMonth >= 1 && filterMonth <= 12
            ? filtered.filter((p) => {
                const d = new Date(p?.paidAt || p?.createdAt || 0);
                return !Number.isNaN(d.getTime()) && d.getUTCMonth() + 1 === filterMonth;
            })
            : filtered;

        res.json(filteredByMonth);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Route to fetch one Mollie payment by payment id (e.g. tr_xxx)
router.get('/fetch-payment/:paymentId', async (req, res) => {
    try {
        const paymentId = String(req.params.paymentId || '').trim();
        if (!paymentId) {
            return res.status(400).json({ error: 'paymentId is required' });
        }

        const payment = await mollieClient.payments.get(paymentId);
        return res.json(payment);
    } catch (error) {
        console.error('Error fetching payment by id:', error);
        return res.status(500).json({ error: error?.message || 'Failed to fetch payment by id' });
    }
});

// Route to fetch one Mollie customer by customer id (e.g. cst_xxx)
router.get('/fetch-customer/:customerId', async (req, res) => {
    try {
        const customerId = String(req.params.customerId || '').trim();
        if (!customerId) {
            return res.status(400).json({ error: 'customerId is required' });
        }

        const customer = await mollieClient.customers.get(customerId);
        return res.json(customer);
    } catch (error) {
        console.error('Error fetching customer by id:', error);
        return res.status(500).json({ error: error?.message || 'Failed to fetch customer by id' });
    }
});

// Route to fetch mandates for a Mollie customer (e.g. cst_xxx)
router.get('/fetch-customer-mandates/:customerId', async (req, res) => {
    try {
        const customerId = String(req.params.customerId || '').trim();
        if (!customerId) {
            return res.status(400).json({ error: 'customerId is required' });
        }

        const result = await mollieClient.customers_mandates.page({ customerId });
        const mandates = result?._embedded?.mandates ?? result?.mandates ?? [];
        return res.json({ customerId, mandates });
    } catch (error) {
        console.error('Error fetching customer mandates:', error);
        return res.status(500).json({ error: error?.message || 'Failed to fetch customer mandates' });
    }
});

// Route to fetch subscriptions for a Mollie customer (e.g. cst_xxx)
router.get('/fetch-customer-subscriptions/:customerId', async (req, res) => {
    try {
        const customerId = String(req.params.customerId || '').trim();
        if (!customerId) {
            return res.status(400).json({ error: 'customerId is required' });
        }

        const result = await mollieClient.customers_subscriptions.page({ customerId });
        const subscriptions = result?._embedded?.subscriptions ?? result?.subscriptions ?? [];
        return res.json({ customerId, subscriptions });
    } catch (error) {
        console.error('Error fetching customer subscriptions:', error);
        return res.status(500).json({ error: error?.message || 'Failed to fetch customer subscriptions' });
    }
});

// Route to fetch payments for a Mollie customer (e.g. cst_xxx)
router.get('/fetch-customer-payments/:customerId', async (req, res) => {
    try {
        const customerId = String(req.params.customerId || '').trim();
        if (!customerId) {
            return res.status(400).json({ error: 'customerId is required' });
        }

        const result = await mollieClient.customers_payments.page({ customerId });
        const payments = result?._embedded?.payments ?? result?.payments ?? [];
        return res.json({ customerId, payments });
    } catch (error) {
        console.error('Error fetching customer payments:', error);
        return res.status(500).json({ error: error?.message || 'Failed to fetch customer payments' });
    }
});

// Route to fetch recent customer transactions across Mollie account
// Example: /api/fetch-recent-transactions?limit=20&status=paid
router.get('/fetch-recent-transactions', async (req, res) => {
    try {
        const limitRaw = Number(req.query?.limit || 20);
        const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 250) : 20;
        const statusFilter = String(req.query?.status || '').trim().toLowerCase();

        const result = await mollieClient.payments.page({ limit });
        const list = Array.isArray(result)
            ? result
            : (result?._embedded?.payments ?? result?.payments ?? result?.data ?? []);
        const payments = Array.isArray(list) ? list : [];

        const filtered = statusFilter
            ? payments.filter((p) => String(p?.status || '').toLowerCase() === statusFilter)
            : payments;

        const customerIds = [...new Set(
            filtered.map((p) => String(p?.customerId || '').trim()).filter(Boolean)
        )];

        const customerMap = {};
        await Promise.all(customerIds.map(async (customerId) => {
            try {
                const c = await mollieClient.customers.get(customerId);
                customerMap[customerId] = {
                    id: c?.id || customerId,
                    name: c?.name || '',
                    email: c?.email || '',
                };
            } catch {
                customerMap[customerId] = { id: customerId, name: '', email: '' };
            }
        }));

        const transactions = filtered.map((p) => {
            const customerId = String(p?.customerId || '');
            return {
                paymentId: p?.id || '',
                customerId,
                customer: customerMap[customerId] || null,
                amount: p?.amount || null,
                status: p?.status || '',
                description: p?.description || '',
                method: p?.method || '',
                createdAt: p?.createdAt || null,
                paidAt: p?.paidAt || null,
                sequenceType: p?.sequenceType || '',
            };
        });

        const latest = [...transactions].sort((a, b) => {
            const da = new Date(a.paidAt || a.createdAt || 0).getTime();
            const db = new Date(b.paidAt || b.createdAt || 0).getTime();
            return db - da;
        });

        return res.json({
            count: latest.length,
            statusFilter: statusFilter || null,
            limit,
            transactions: latest,
        });
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        return res.status(500).json({ error: error?.message || 'Failed to fetch recent transactions' });
    }
});

// Resolve customerId from a paymentId (tr_xxx → cst_xxx)
async function resolveCustomerId(idOrPaymentId) {
    const id = String(idOrPaymentId || '').trim();
    if (id.startsWith('cst_')) return id;
    if (id.startsWith('tr_')) {
        const payment = await mollieClient.payments.get(id);
        return String(payment?.customerId || '');
    }
    return '';
}

// Route to fetch complete recurring profile summary
// Accepts: /fetch-customer-profile/:id  where id can be cst_xxx OR tr_xxx
// Also accepts ?paymentId=tr_xxx as fallback
router.get('/fetch-customer-profile/:id', async (req, res) => {
    try {
        let customerId = '';
        const paramId = String(req.params.id || '').trim();
        const queryPaymentId = String(req.query.paymentId || '').trim();

        // Try param first, then query paymentId
        if (paramId.startsWith('cst_')) {
            customerId = paramId;
        } else if (paramId.startsWith('tr_')) {
            customerId = await resolveCustomerId(paramId);
        }

        if (!customerId && queryPaymentId.startsWith('tr_')) {
            customerId = await resolveCustomerId(queryPaymentId);
        }

        if (!customerId) {
            return res.status(400).json({ error: 'Could not resolve a valid Mollie customer ID', paramId, queryPaymentId });
        }

        const [customer, mandatesResult, subscriptionsResult, paymentsResult] = await Promise.all([
            mollieClient.customers.get(customerId),
            mollieClient.customers_mandates.page({ customerId }),
            mollieClient.customers_subscriptions.page({ customerId }),
            mollieClient.customers_payments.page({ customerId }),
        ]);

        const toArray = (r, key) => {
            if (Array.isArray(r)) return r;
            if (r?._embedded?.[key]) return r._embedded[key];
            if (r?.[key]) return r[key];
            // Mollie client returns iterable objects; spread to array
            try { return [...r]; } catch { return []; }
        };
        const mandates = toArray(mandatesResult, 'mandates');
        const subscriptions = toArray(subscriptionsResult, 'subscriptions');
        const payments = toArray(paymentsResult, 'payments');

        const paidPayments = payments
            .filter((p) => p?.status === 'paid' && p?.paidAt)
            .sort((a, b) => (a.paidAt > b.paidAt ? 1 : -1));

        const firstPaymentAt = paidPayments[0]?.paidAt ?? null;
        const lastPaymentAt = paidPayments.length > 0 ? paidPayments[paidPayments.length - 1]?.paidAt : null;

        const activeSubscriptions = subscriptions
            .filter((s) => ['active', 'pending'].includes(String(s?.status || '').toLowerCase()));

        const nextPaymentDates = activeSubscriptions
            .map((s) => s?.nextPaymentDate)
            .filter(Boolean)
            .sort();

        const nextPaymentDate = nextPaymentDates[0] ?? null;

        return res.json({
            customerId,
            customer,
            mandates,
            subscriptions,
            payments: payments.map((p) => ({
                id: p.id,
                amount: p.amount,
                status: p.status,
                description: p.description,
                createdAt: p.createdAt,
                paidAt: p.paidAt,
                method: p.method,
            })),
            summary: {
                firstPaymentAt,
                lastPaymentAt,
                nextPaymentDate,
                activeSubscriptionsCount: activeSubscriptions.length,
                totalSubscriptionsCount: subscriptions.length,
                paidPaymentsCount: paidPayments.length,
                totalPaymentsCount: payments.length,
                subscriptionDetails: activeSubscriptions.map((s) => ({
                    id: s.id,
                    description: s.description,
                    amount: s.amount,
                    interval: s.interval,
                    status: s.status,
                    nextPaymentDate: s.nextPaymentDate,
                    createdAt: s.createdAt,
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching customer profile:', error);
        return res.status(500).json({ error: error?.message || 'Failed to fetch customer profile' });
    }
});

module.exports = router;
