const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/contact-email', async (req, res) => {
    const { data } = req.body;

    if (!data || !data.email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const { email, hoeheeft, message, naam, onderwep } = data;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fahadrafiq16@gmail.com',
            pass: 'mwjuoyfenyuwesli', // ❗use env var in real app
        },
    });

    const mailOptions = {
        from: 'fahadrafiq16@gmail.com',
        to: [email, 'service@mysummerbodyclub.nl', 'fahadrafiq16@gmail.com'],
        subject: 'Uw bericht is in gediend. - Marlon',
        html: `
          <div style="border: 2px solid #F04D17; padding: 20px; font-size:15px; background-color: #f9f9f9; border-radius: 10px; font-family: Arial, sans-serif; color: #333;">
                    <!-- Header Section -->
                    <div style="text-align: center;">
                        <img style="max-width: 150px; height: auto; display: block; margin: 0 auto;" src="https://mysummerbodyclub.nl/wp-content/uploads/2023/06/Image20230617095400.png" alt="logo" />
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                        <h2 style="color: #2c398e; font-weight: bold; border-bottom: 4px solid #F04D17; padding-bottom: 10px; display: inline-block;">
                            IF IT'S NOT PERSONAL, IT'S NOT POSSIBLE
                        </h2>
                    </div>
                    <div style="margin: 20px 0;">
                        <img style="width: 100%; border: 2px solid #F04D17; border-radius: 5px;" src="https://mysummerbodyclub.nl/wp-content/uploads/2023/09/Image20230902193001.png" alt="banner image" />
                    </div>
                    
                    

                    <!-- Personal Details -->
                    <div style="margin: 20px 0; padding: 15px; background-color: #f3f3f3; border-radius: 5px; border-left: 5px solid #F04D17;">
                        <h3 style="color: #F04D17;">Persoonlijke Gegevens</h3>
                        <p><strong>Naam:</strong> ${naam}</p>
                         <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Onderwep:</strong> ${onderwep}</p>
                        <p><strong>Message:</strong> ${message}</p>
                        <p><strong>Hoe heeft u ons gevonden?:</strong> ${hoeheeft}</p>
                    </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            response: info.response,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message,
        });
    }
});

module.exports = router;