const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');
const nodemailer = require('nodemailer');
const sendEmail = require('./nodemailer-test.cjs');


const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const conditionMet = true;  // Replace with your actual condition

async function checkAndSendEmail() {
    if (conditionMet) {
        try {
            const module = await import('./app-email.js');
            module.sendEmail();  // Calling the function from app-email.js
        } catch (error) {
            console.error('Error importing app-email.js:', error);
        }
    }
}

checkAndSendEmail();



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
            redirectUrl: `http://localhost:3000/?name=${encodeURIComponent(userInfo.voornaam)}&selectedOption=${encodeURIComponent(userInfo.selectedOption.title)}&subTitle=${encodeURIComponent(userInfo.selectedOption.subTitle)}`,

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
    console.log('Payment Id', paymentId);

    try {
        const payment = await mollieClient.payments.get(paymentId);
        console.log(payment.metadata);

        if (payment.status === 'paid') {
            console.log('Paid');

            // Extract user email and other info from metadata
            const { email,
                voornaam,
                achternaam,
                geslachtooptions,
                dayOfMonth,
                month,
                years,
                postcode,
                huisnummer,
                adres,
                woonplaats,
                totalAmount,
                clubAmount,

            } = payment.metadata.userInfo;

            // Destructure with renaming to avoid name conflicts
            const { subTitle, trainingTitle, title: selectedOptionTitle, amount: selectedOptionAmount } = payment.metadata.userInfo.selectedOption || {};
            const { amount: extraOptionAmount, title: extraOptionTitle } = payment.metadata.userInfo.extraOption || {};

            if (!email || !voornaam) {
                return res.status(400).send("Recipient email and name are required.");
            }

            try {
                const emailModule = await import("./app-email.js");
                await emailModule.sendEmail(
                    email,
                    voornaam,
                    achternaam,
                    geslachtooptions,
                    dayOfMonth,
                    month,
                    years,
                    postcode,
                    huisnummer,
                    adres,
                    woonplaats,
                    subTitle,
                    trainingTitle,
                    { selectedOptionTitle, selectedOptionAmount, extraOptionTitle, extraOptionAmount },
                    totalAmount,
                    clubAmount,
                    paymentId,
                );

                return res.send(`Email sent successfully to ${email}!`); // Return after sending response
            } catch (error) {
                console.error("Error importing or sending email:", error);
                return res.status(500).send("Failed to send email."); // Return to prevent further execution
            }
        } else if (payment.status === 'failed') {


            // Inside your backend webhook after processing payment:
            redirectUrl.searchParams.append('paymentId', 123); // Append paymentId to the URL
            console.log('Failed');
        }

        return res.sendStatus(200); // Return to ensure this is the only response sent
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Webhook error'); // Only one response is sent here
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
