const sendEmail = require('../nodemailer-test.js'); // Adjust path as necessary
const express = require('express');
const { createMollieClient } = require('@mollie/api-client');
const cors = require('cors');
const nodemailer = require('nodemailer');
const router = express.Router();
const axios = require('axios');


const mollieClient = createMollieClient({ apiKey: 'test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt' });

const app = express();
const port = process.env.PORT || 5000;


// Email Payment Webhook for Non-Recurring Payments
const nonRecurringPaymentWebhook = async (req, res) => {
    console.log('Webhook received:', req.body); // Log the incoming request for debugging
    const paymentId = req.body.id;
    console.log('Payment Id', paymentId);

    try {
        const payment = await mollieClient.payments.get(paymentId);
        console.log(payment.metadata);

        if (payment.status === 'paid') {
            console.log('Paid');

            // Extract user email and other info from metadata
            const {
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
                totalAmount,
                clubAmount,
            } = payment.metadata.userInfo;

            const { subTitle, trainingTitle, title: selectedOptionTitle, amount: selectedOptionAmount } = payment.metadata.userInfo.selectedOption || {};
            const { amount: extraOptionAmount, title: extraOptionTitle } = payment.metadata.userInfo.extraOption || {};

            const today = new Date();

            const day = today.getDate(); // Get day of the month
            const year = today.getFullYear(); // Get year
            
            // Get month name
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthNow = monthNames[today.getMonth()]; // Get month name
            
            // Construct the date string
            const formattedDate = `${day} ${monthNow}, ${year}`;

            

            if (!email || !voornaam) {
                return res.status(400).send("Recipient email and name are required.");
            }

            try {
                sendEmail(
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
                    formattedDate
                );

                return res.send(`Email sent successfully to ${email}!`);

            } catch (error) {
                console.error("Error sending email:", error);
                return res.status(500).send("Failed to send email.");
            }

        } else  {
            console.log('Failed');
            res.redirect('http://localhost:3000/?status=failed');
            // Optionally handle failure here
            // You can redirect to a URL or notify the user as needed
        }

    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Webhook error');
    }
};

module.exports = nonRecurringPaymentWebhook;