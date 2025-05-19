const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');
const nodemailer = require('nodemailer');



const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));





// Nodemailer transport configuration
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "maddison53@ethereal.email",
      pass: "jn7jnAPss4f63QBp6D",
    },
  });

// Example route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
// Mollie create payment
app.post('/api/create-payment', async (req, res) => {
    const { amount, userInfo } = req.body;

    try {
        const payment = await mollieClient.payments.create({
            amount: {
                value: amount, // Amount in the selected currency
                currency: 'EUR', // Change this if needed
            },
            description: `Payment for ${userInfo.voornaam}`, // Description for the payment
            redirectUrl: `http://localhost:3000/success?name=${encodeURIComponent(userInfo.voornaam)}&selectedOption=${encodeURIComponent(userInfo.selectedOption.title)}&subTitle=${encodeURIComponent(userInfo.selectedOption.subTitle)}`,

            webhookUrl: ' https://1171-39-55-119-111.ngrok-free.app/api/payment-webhook', // Webhook URL to handle payment updates
            metadata: {

                userInfo, // Additional user info you want to track
            },
        });

        res.json({ paymentUrl: payment.links.checkout.href });
    } catch (error) {
        console.error('Error creating payment123:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

app.post('/api/payment-webhook', async (req, res) => {
    console.log('Webhook received:', req.body); // Log the incoming request for debugging
    const paymentId = req.body.id;
    console.log('Payment Id', req.body.id);

    try {
        const payment = await mollieClient.payments.get(paymentId);
        console.log(payment.metadata);

        if (payment.status === 'paid') {
            console.log('Paid');

            // Extract user email and other info from metadata
            const { email, voornaam } = payment.metadata.userInfo;
            const paymentDetails = `
                <h1>Payment Confirmation</h1>
                <p>Dear ${voornaam},</p>
                <p>Thank you for your payment! Here are the details of your transaction:</p>
                <ul>
                    <li>Amount: €${payment.amount.value}</li>
                    <li>Description: ${payment.description}</li>
                    <li>Payment ID: ${payment.id}</li>
                </ul>
                <p>We appreciate your support!</p>
            `;

            // Send email
            const mailOptions = {
                from: 'maddison53@ethereal.email', // Sender address
                to: email, // Receiver email
                subject: 'Payment Confirmation',
                html: paymentDetails, // HTML body
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email:', err);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        } else if (payment.status === 'failed') {
            console.log('Failed');
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Webhook error');
    }
});

// Route to fetch all payment records and log them
app.get('/api/fetch-payments', async (req, res) => {
    try {
        // Fetch all payments
        const payments = await mollieClient.payments.all();

        // Log the payments to the console
        console.log('All Payments:', payments);

        // Send response
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});





// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
