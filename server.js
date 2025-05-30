const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const axios = require('axios');
const mongoose = require("mongoose");


const BASE_FRONTEND_URL = process.env.BASE_FRONTEND_URL;
const BASE_BACKEND_URL = process.env.BASE_BACKEND_URL;
const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

const app = express();
const port = process.env.PORT || 5000;


const fetchPaymentsRoute = require('./routes/FetchPayments');
const createPaymentRoute = require('./routes/CreatePayment.js');
const chargingRecurringPayment = require('./routes/ChargingRecurringPayment.js');
const recurringEmail = require('./routes/recurring-email.js');
const failedEmail = require('./routes/failed-email.js');

const userRoutes = require('./routes/userRoutes.js');
const getPayments = require('./routes/getPayments.js');
const getPaymentById = require('./routes/getPaymentById.js');
const deletePaymentById = require('./routes/deletePaymentById.js');



const nonRecurringWebhook = require('./Webhooks/NonRecurringWebHook.js'); // Adjust path as necessary


app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Fetch all payments route
app.use('/api', fetchPaymentsRoute);

// Create Non-recurring payment route
app.use('/api', createPaymentRoute);

// Recurring Email
app.use('/api', recurringEmail);

// Failed Email
app.use('/api', failedEmail);

// Non recurring payment webhook
app.post('/api/payment-webhook', nonRecurringWebhook);


// Charging Recurring Payment route
app.use('/api', chargingRecurringPayment);

// Example route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});



app.post('/api/subscription-webhook', async (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).send('Webhook received');
});


// Create a customer and setup a subscription
app.post('/api/create-recurring-payment', async (req, res) => {
    try {
        const { email, name, userInfo } = req.body;

        // Step 1: Create a customer
        const customer = await mollieClient.customers.create({
            name,
            email,
        });

        // Step 2: Create a mandate (authorization for recurring charges)
        const payment = await mollieClient.payments.create({
            amount: {
                value: '0.01', // First payment amount (e.g., $1.00 for mandate setup)
                currency: 'EUR',
            },
            description: 'Initial payment for recurring subscription',
            customerId: customer.id,
            sequenceType: 'first', // Indicate this is the first payment
            redirectUrl: `hhttps://magnificent-horse-a4affe.netlify.app/recurring-redirect?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`,

            webhookUrl: `${BASE_BACKEND_URL}/api/payment-recurring-webhook`,
            metadata: {
                userInfo,
            }
        });

        // Return payment link to the frontend
        res.json({ paymentUrl: payment.getCheckoutUrl() });
    } catch (error) {
        console.error('Error creating recurring payment:', error);
        res.status(500).json({ message: 'Failed to create recurring payment' });
    }
});

// Webhook to handle payment or subscription updates
app.post('/api/payment-recurring-webhook', async (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).send('Webhook received');
});



app.post('/api/subscription-webhook', async (req, res) => {
    console.log('Subscription Webhook received', req.body);
    res.status(200).send('Subscription webhook received');
})


//  Mongodb connection

mongoose
    .connect("mongodb+srv://fahadrafiq16:xtA7llHiJCPF7tL5@cluster0.nyxio.mongodb.net/mysummerbodyclub")
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("MongoDB connection error:", err));


app.use('/api', userRoutes);

app.use('/api', getPayments);

app.use('/api', getPaymentById);

app.use('/api', deletePaymentById);






// Start the server
app.listen(port, async () => {
    console.log(`Server is running on https://1171-39-55-119-111.ngrok-free.app:${port}`);
    //await createSubscriptionOnServerStart();
});
