function verificationEmailTemplate(name, verificationLink) {
    return `
        <h2>Hello ${name},</h2>

        <p>Thank you for registering.</p>

        <p>Please verify your email by clicking the link below:</p>

        <a href="${verificationLink}">
            Verify Email
        </a>

        <p>This link will expire in 24 hours.</p>

        <p>If you didn't create this account, you can safely ignore this email.</p>
    `;
}

module.exports = verificationEmailTemplate;