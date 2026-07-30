function resetPasswordEmailTemplate(name, resetLink) {
    return `
        <h2>Hello ${name},</h2>

        <p>We received a request to reset your password.</p>

        <p>Click the link below to reset your password:</p>

        <a href="${resetLink}">
            Reset Password
        </a>

        <p>This link will expire in 15 minutes.</p>

        <p>If you didn't request a password reset, you can safely ignore this email.</p>
    `;
}

module.exports = resetPasswordEmailTemplate;
