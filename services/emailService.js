const transporter = require("../config/mail");

async function sendEmail({ to, subject, html }) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    });
}

async function sendOrganizationInvitationEmail({
    email,
    organizationName,
    token
}) {
    const inviteLink = `http://localhost:5173/accept-invitation?token=${token}`;

    await sendEmail({
        to: email,
        subject: `Invitation to join ${organizationName}`,
        html: `
            <h2>Organization Invitation</h2>
            <p>You have been invited to join <b>${organizationName}</b>.</p>
            <p>
                <a href="${inviteLink}">
                    Accept Invitation
                </a>
            </p>
        `
    });
}

module.exports = {
    sendEmail,
    sendOrganizationInvitationEmail
};