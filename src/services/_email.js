/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */
require('dotenv').config();
const nodemailer = require('nodemailer');
const {
    MAIL_HOST,
    MAIL_PASS,
    MAIL_PORT,
    MAIL_USER,
    APP_CLIENT_URI,
} = process.env;

const configure_mail_transport = () => {
    const config = {
        pool: true,
        host: MAIL_HOST,
        port: MAIL_PORT,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    };

    return nodemailer.createTransport(config);
};

const configure_message = (recipient, value, type) => {
    let subject = '', text = '';

    switch (type) {
        case 'activation':
            subject = `GoMailer: Account Activation`;
            html = `
                    <p> Kindly click the link to activate your account.<p>
                    <br/>
                    <p><a href=${APP_CLIENT_URI}/activation/${value}>Activate Account</a></p>
                `;
            break;
        case 'mailbox':
            subject = `GoMailer: Email Verification`;
            html = `
                <p> Here's you verification code.<p>
                <br/>
                <h2>${value}</h2>
            `;
            break;
        case 'otp':
            subject = `GoMailer OTP`;
            html = `
                    <p>Kindly use this OTP to log in:</p> 
                    <br/>
                    <p><b>${value}</b></p>
                    <br/>
                    <p style="color: red;">It will expire after five (5) minutes.</p>
                    `;
            break;
        case 'recovery':
            subject = `GoMailer: Account Recovery`;
            html = `
                            <p> Kindly click the link to recover your account.<p>
                            <br/>
                            <p><a href=${APP_CLIENT_URI}/password/reset/${value}>Recover Account</a></p>
                        `;
            break;
        default:
            throw new Error(`MAILING ERROR: incorrect message type: ${type}`);
    }

    return {
        subject,
        html,
        to: recipient,
        from: `"GoMailer" <${MAIL_USER}>`,
    };
};

module.exports = {
    send_email: async (recipient, value, type) => {
        const transport = configure_mail_transport();
        const message_config = configure_message(recipient, value, type);
        const { messageId } = await transport.sendMail(message_config);
        return !!messageId;
    },
}