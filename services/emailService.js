const transporter = require("../config/mail");

async function sendEmail({ to, subject, html }) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    });
}

module.exports = {
    sendEmail
};