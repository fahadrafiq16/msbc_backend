const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/failed-email', async (req, res) => {
    const { userInfo } = req.body;

    if (!userInfo || !userInfo.email) {
        return res.status(400).json({ error: 'User information and email are required' });
    }

    const {
        voornaam,
        achternaam,
        geslachtooptions,
        postcode,
        huisnummer,
        adres,
        woonplaats,
       
        clubAmount,
        totalAmount,
        
        dayOfMonth,
        month,
        years,
    } = userInfo;

    const { subTitle, trainingTitle, title: selectedOptionTitle, amount: selectedOptionAmount } = userInfo.selectedOption || {};
    const { amount: extraOptionAmount, title: extraOptionTitle } = userInfo.extraOption || {};

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

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred email service
        auth: {
            user: 'fahadrafiq16@gmail.com',
            pass: 'mwjuoyfenyuwesli', // Use environment variables for security
        },
    });

    const mailOptions = {
        from: 'fahadrafiq16@gmail.com',
        to: userInfo.email,
        subject: 'Betaling en inschrijving is niet gelukt',
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
                        <img style="width: 100%; border: 2px solid #F04D17; border-radius: 5px;" src="https://mysummerbodyclub.nl/wp-content/uploads/2024/06/Image20240611163627.png" alt="banner image" />
                    </div>
                    
                    <!-- Email Content -->
                    <div style="padding: 20px; background-color: #ffffff; border-radius: 5px;">
                        <p><strong>Onderwerp:</strong> Betaling en inschrijving voor niet gelukt</em></p>
                        <p><strong>Datum:</strong> <em>${formattedDate}</em></p>
                        <p><strong>Beste ${voornaam},</strong></p>
                        <p>Je betaling en inschrijving voor <em>${trainingTitle}</em>  is helaas niet gelukt.</p>
                        <p>Er is geen bedrag van je reening afgeschreven..</p>
                        <p>Wij raden je aan om je gegevens en e-mailadres nogmaals te controleren en vervolgens opnieuw te proberen je in te schrijven.</p>
                        <p>Mocht het na meerdere pogingen nog steeds niet lukken, neem dan gerust contact met ons op voor verdere assistentie via <em>service@mysummerbodyclub.nl</em></p>
                        <p>Met sportieve groet,</p>
                        <p><strong>Team My Summerbody Club</strong></p>
                    </div>
                    
                 
                    
            
              
            
                    <!-- Footer Section -->
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
            
                    <!-- Social Links -->
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
                    `, // Plain text content
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;