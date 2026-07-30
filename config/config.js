const requiredEnvVariables = [
    "MONGO_URI",
    "JWT_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
    "CLIENT_URL"
];

for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
        console.error(`❌ Missing required environment variable: ${variable}`)
        process.exit(1)
    }
}

const config = Object.freeze({
    port: Number(process.env.PORT) || 3000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    environment: process.env.NODE_ENV || "development"
})

module.exports = config