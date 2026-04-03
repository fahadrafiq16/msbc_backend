const express = require('express');
const nodemailer = require('nodemailer');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/send-reminder-email', authenticateToken, async (req, res) => {
    const { email, voornaam, achternaam, trainingTitle, totalAmount, selectedOptionTitle } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const name = [voornaam, achternaam].filter(Boolean).join(' ') || 'klant';

    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const monthNames = [
        'januari', 'februari', 'maart', 'april', 'mei', 'juni',
        'juli', 'augustus', 'september', 'oktober', 'november', 'december'
    ];
    const formattedDate = `${day} ${monthNames[today.getMonth()]} ${year}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fahadrafiq16@gmail.com',
            pass: 'mwjuoyfenyuwesli',
        },
    });

    const mailOptions = {
        from: 'fahadrafiq16@gmail.com',
        to: email,
        subject: 'Betalingsherinnering – My Summerbody Club',
        html: `
        <div style="border: 2px solid #F04D17; padding: 20px; font-size:15px; background-color: #f9f9f9; border-radius: 10px; font-family: Arial, sans-serif; color: #333;">
            <!-- Header -->
            <div style="text-align: center;">
                <img style="max-width: 150px; height: auto; display: block; margin: 0 auto;" src="https://mysummerbodyclub.nl/wp-content/uploads/2023/06/Image20230617095400.png" alt="logo" />
            </div>
            <div style="text-align: center; margin: 20px 0;">
                <h2 style="color: #2c398e; font-weight: bold; border-bottom: 4px solid #F04D17; padding-bottom: 10px; display: inline-block;">
                    BETALINGSHERINNERING
                </h2>
            </div>
            <div style="margin: 20px 0;">
                <img style="width: 100%; border: 2px solid #F04D17; border-radius: 5px;" src="https://mysummerbodyclub.nl/wp-content/uploads/2024/06/Image20240611163627.png" alt="banner image" />
            </div>

            <!-- Content -->
            <div style="padding: 20px; background-color: #ffffff; border-radius: 5px;">
                <p><strong>Datum:</strong> <em>${formattedDate}</em></p>
                <p><strong>Beste ${voornaam || name},</strong></p>
                <p>Volgens onze administratie staat er nog een betaling open voor jouw abonnement${trainingTitle ? ' <em>' + trainingTitle + '</em>' : ''}${selectedOptionTitle ? ' (' + selectedOptionTitle + ')' : ''}.</p>
                ${totalAmount ? '<p>Het openstaande bedrag is: <strong>€' + totalAmount + '</strong></p>' : ''}
                <p>Wij verzoeken je vriendelijk om de betaling zo spoedig mogelijk te voldoen.</p>
                <p>Mocht je de betaling al hebben gedaan, dan kun je deze herinnering als niet verzonden beschouwen.</p>
                <p>Heb je vragen of problemen met het betalen? Neem dan gerust contact met ons op via <em>service@mysummerbodyclub.nl</em> of bel naar <em>+(0) 627 28 28 56</em>.</p>
                <p>Met sportieve groet,</p>
                <p><strong>Team My Summerbody Club</strong></p>
            </div>

            <!-- Trainingen -->
            <div style="text-align: center; margin: 20px 0;">
                <h3 style="color: #2c398e;">Onze Trainingen</h3>
                <p>
                    <a href="https://mysummerbodyclub.nl/trainingprograms/small-group-training/" style="color: #F04D17; text-decoration: none;">Small Group Training</a> |
                    <a href="https://mysummerbodyclub.nl/trainingprograms/afvallen/" style="color: #F04D17; text-decoration: none;">Afvallen</a> |
                    <a href="https://mysummerbodyclub.nl/trainingprograms/personal-training/" style="color: #F04D17; text-decoration: none;">Personal Training</a>
                </p>
                <p>
                    <a href="https://mysummerbodyclub.nl/" style="color: #2c398e; text-decoration: none; font-weight: bold;">www.mysummerbodyclub.nl</a>
                </p>
            </div>

            <!-- Social -->
            <div style="text-align: center; margin: 20px 0; padding: 10px; background-color: #F04D17; color: #ffffff; border-radius: 5px;">
                <a href="https://web.facebook.com/mysummerbodyclub" style="margin: 0 10px;">
                    <img src="https://mysummerbodyclub.nl/wp-content/uploads/2023/09/107153_circle_facebook_icon.png" alt="Facebook" style="width: 30px; height: 30px;" />
                </a>
                <a href="https://www.instagram.com/mysummerbodyclub/" style="margin: 0 10px;">
                    <img src="https://mysummerbodyclub.nl/wp-content/uploads/2023/09/5279112_camera_instagram_social-media_instagram-logo_icon.png" alt="Instagram" style="width: 30px; height: 30px;" />
                </a>
                <a href="https://www.youtube.com/@mysummerbodyclub" style="margin: 0 10px;">
                    <img src="https://mysummerbodyclub.nl/wp-content/uploads/2023/09/5305164_play_video_youtube_youtube-logo_icon.png" alt="YouTube" style="width: 30px; height: 30px;" />
                </a>
            </div>

            <p style="text-align: center; font-size: 14px; color: #666;">KVK 59250097 | Btw: NL003699102B10 | Contact: T +(0) 627 28 28 56 | E: info@mysummerbody.nl</p>
        </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Reminder email sent:', info.response);
        res.status(200).json({ message: 'Reminder email sent successfully' });
    } catch (error) {
        console.error('Error sending reminder email:', error);
        res.status(500).json({ error: 'Failed to send reminder email' });
    }
});

module.exports = router;
