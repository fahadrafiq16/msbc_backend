const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();
const axios = require('axios');
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");


const BASE_FRONTEND_URL = process.env.BASE_FRONTEND_URL;
const BASE_BACKEND_URL = process.env.BASE_BACKEND_URL;
const MONGODB_URI = process.env.MONGODB_URI;
const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;


const fetchPaymentsRoute = require('./routes/FetchPayments');
const createPaymentRoute = require('./routes/CreatePayment.js');
const chargingRecurringPayment = require('./routes/ChargingRecurringPayment.js');
const recurringEmail = require('./routes/recurring-email.js');
const failedEmail = require('./routes/failed-email.js');
const informatieEmail = require('./routes/informatieEmail.js');
const proeflesEmail = require('./routes/proeflesEmail.js');
const contactEmail = require('./routes/contactEmail.js');

const userRoutes = require('./routes/userRoutes.js');
const getPayments = require('./routes/getPayments.js');
const getPaymentById = require('./routes/getPaymentById.js');
const deletePaymentById = require('./routes/deletePaymentById.js');

const customersFeedbackRoutes = require('./routes/customersFeedback.js');
const authRoutes = require('./routes/auth.js');
const trainingConfigRoutes = require('./routes/trainingConfig.js');
const { ensureAdminSettings } = require('./utils/adminSettings');
const authenticateToken = require('./middleware/authMiddleware');


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

// Informatie Email
app.use('/api', informatieEmail);

// Proefles Email
app.use('/api', proeflesEmail);

// Contact Email
app.use('/api', contactEmail);

// Failed Email
app.use('/api', failedEmail);




// Non recurring payment webhook
app.post('/api/payment-webhook', nonRecurringWebhook);


// Charging Recurring Payment route
app.use('/api', chargingRecurringPayment);

// Auth routes
app.use('/api/auth', authRoutes);

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
            redirectUrl: `${String(BASE_FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "")}/recurring-redirect?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`,

            webhookUrl: `${BASE_BACKEND_URL}/api/payment-recurring-webhook`,
            metadata: {
                userInfo: {
                    voornaam: userInfo?.voornaam || '',
                    achternaam: userInfo?.achternaam || '',
                    email: userInfo?.email || '',
                    telefoonnummer: userInfo?.telefoonnummer || '',
                    totalAmount: userInfo?.totalAmount || '',
                    clubAmount: userInfo?.clubAmount ?? 0,
                    selectedOption: {
                        trainingTitle: userInfo?.selectedOption?.trainingTitle || '',
                        programType: userInfo?.selectedOption?.programType || '',
                        amount: userInfo?.selectedOption?.amount || '',
                        title: userInfo?.selectedOption?.title || '',
                        recurring: Boolean(userInfo?.selectedOption?.recurring),
                    },
                },
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

if (!MONGODB_URI) {
    console.error("MongoDB connection skipped: MONGODB_URI is not set in .env");
} else {
    mongoose
        .connect(MONGODB_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error("MongoDB connection error:", err.message || err));
}


app.use('/api', userRoutes);

app.use('/api', getPayments);

app.use('/api', getPaymentById);

app.use('/api', deletePaymentById);

const reminderEmail = require('./routes/reminderEmail.js');
app.use('/api', reminderEmail);

const updateUserInfo = require('./routes/updateUserInfo.js');
app.use('/api', updateUserInfo);

const dashboardStats = require('./routes/dashboardStats.js');
app.use('/api', dashboardStats);

// Customers Feedback
app.use('/api', customersFeedbackRoutes);

// Training config (AfvallenTraining data)
app.use('/api', trainingConfigRoutes);

// Club Toggle Switch MongoDB

// ✅ Schema & Model
const toggleSchema = new mongoose.Schema({
    value: { type: Boolean, default: false },
    amount: { type: Number, default: 15 }  // add club amount
});
const Toggle = mongoose.model("Toggle", toggleSchema);

// ✅ Get current toggle + amount
app.get("/api/toggle", authenticateToken, async (req, res) => {
    try {
        let toggle = await Toggle.findOne();
        if (!toggle) {
            toggle = await Toggle.create({ value: false, amount: 15 }); // defaults
        }
        res.json({ value: toggle.value, amount: toggle.amount });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch toggle" });
    }
});

// ✅ Update toggle or amount
app.post("/api/toggle", authenticateToken, async (req, res) => {
    try {
        const { value, amount } = req.body;
        let toggle = await Toggle.findOne();

        if (!toggle) {
            toggle = new Toggle({ value: value ?? false, amount: amount ?? 15 });
        } else {
            if (value !== undefined) toggle.value = value;
            if (amount !== undefined) toggle.amount = amount;
        }

        await toggle.save();
        res.json({ success: true, value: toggle.value, amount: toggle.amount });
    } catch (err) {
        res.status(500).json({ error: "Failed to update toggle" });
    }
});

// Uploading a testimonial apis














// ─── Cron: paused – will resume with conditions later ───
// const cron = require('node-cron');
// const cronTransporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: 'fahadrafiq16@gmail.com', pass: 'mwjuoyfenyuwesli' },
// });
// cron.schedule('*/1 * * * *', async () => {
//   try {
//     await cronTransporter.sendMail({
//       from: 'fahadrafiq16@gmail.com',
//       to: 'fahadrafiq16@gmail.com',
//       subject: `[CRON TEST] ${new Date().toLocaleString()}`,
//       text: `This is a test cron email sent at ${new Date().toISOString()}`,
//     });
//     console.log('[CRON] Test email sent at', new Date().toLocaleString());
//   } catch (err) {
//     console.error('[CRON] Failed to send test email:', err.message);
//   }
// });

// Start the server
app.listen(port, async () => {
    try {
        await ensureAdminSettings();
        console.log("Admin settings ready");
    } catch (err) {
        console.error("Failed to ensure admin settings:", err);
    }
    console.log(`Server is running on https://1171-39-55-119-111.ngrok-free.app:${port}`);
    //await createSubscriptionOnServerStart();
});
