// nodemailer-test.cjs
const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer.
 * @param {string} userEmail - Sender's email address.
 * @param {string} appPassword - Sender's app password.
 * @param {string} recipientEmail - Recipient's email address.
 * @param {string} emailSubject - Subject of the email.
 * @param {string} emailText - Plain text content of the email.
 */
const sendEmail = async (
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
    { selectedOptionTitle = '', selectedOptionAmount = 0, extraOptionTitle = '', extraOptionAmount = 0 } = {},
    totalAmount,
    clubAmount,
    paymentId,
) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fahadrafiq16@gmail.com', // Replace with your Gmail address
            pass: 'mwjuoyfenyuwesli', // Replace with your Google app password
        },
    });

    // Define the email options
    const mailOptions = {
        from: 'fahadrafiq16@gmail.com', // Sender's email address
        to: email, // Receiver's email address
        subject: 'Email from My Summer Body Club', // Email subject
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
                    
                    <!-- Email Content -->
                    <div style="padding: 20px; background-color: #ffffff; border-radius: 5px;">
                        <p><strong>Onderwerp:</strong> Aanmelding <em>${trainingTitle}</em> abonnement</p>
                        <p><strong>Datum:</strong> <em>${dayOfMonth}-${month}-${years}</em></p>
                        <p><strong>Beste ${voornaam},</strong></p>
                        <p>Welkom bij My Summerbody Club!</p>
                        <p>Bedankt, we hebben je betaling ontvangen en je bent aangemeld voor ons <em>${trainingTitle}</em> abonnement.</p>
                    </div>
                    
                    <!-- Personal Details -->
                    <div style="margin: 20px 0; padding: 15px; background-color: #f3f3f3; border-radius: 5px; border-left: 5px solid #F04D17;">
                        <h3 style="color: #F04D17;">Persoonlijke Gegevens</h3>
                        <p><strong>Voornaam:</strong> ${voornaam}</p>
                        <p><strong>Achternaam:</strong> ${achternaam}</p>
                        <p><strong>Geslacht:</strong> ${geslachtooptions}</p>
                        <p><strong>Geboortedatum:</strong> ${dayOfMonth}-${month}-${years}</p>
                    </div>
            
                    <!-- Address Details -->
                    <div style="margin: 20px 0; padding: 15px; background-color: #f3f3f3; border-radius: 5px; border-left: 5px solid #2c398e;">
                        <h3 style="color: #2c398e;">Adresgegevens</h3>
                        <p><strong>Postcode:</strong> ${postcode}</p>
                        <p><strong>Huisnummer:</strong> ${huisnummer}</p>
                        <p><strong>Adres:</strong> ${adres}</p>
                        <p><strong>Woonplaats:</strong> ${woonplaats}</p>
                    </div>
            
                    <!-- Order Summary -->
                    <div style="margin: 20px 0; padding: 15px; background-color: #ffffff; border-radius: 5px; border: 1px solid #ddd;">
                        <h3 style="color: #F04D17;">Abonnement Informatie</h3>
                        <p><strong>Abonnement type:</strong> ${subTitle}</p>
                        <p>${selectedOptionAmount} - ${selectedOptionTitle}</p>
                        <p><strong>Extra:</strong> ${extraOptionAmount} - ${extraOptionTitle}</p>
                        <p><strong>Éénmalige kosten:</strong> </p>
                        <p><strong>Inschrijfgeld:</strong> - € 24,99</p>
                        <p><strong>Clubpas/ QR-code </strong>€ ${clubAmount},00.</p>
                        <p><strong>Betaald bedrag:€ ${totalAmount}</strong></p>
                        <p>Daarna maandelijkse kosten van <strong>€ ${selectedOptionAmount}</strong> tot einde periode.</p>
                        <p>Wilt u deze bevestiging gereed houden als u contact met ons opneemt, dan kunnen we u meteen van dienst zijn.</p>
                        <p><strong>Tot ziens,</strong></p>
                        <p>Met sportieve groet,</p>
                        <p>Team - My Summerbody Club</p>
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

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
