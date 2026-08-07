const bcrypt = require("bcrypt")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const User = require("../models/user")
const config = require("../config/config")
const AppError = require("../utils/AppError")
const { generateRandomToken, hashToken } = require("../utils/security")
const { generateAccessToken, generateRefreshToken } = require("../utils/token")
const { sendEmail } = require("./emailService")
const { uploadToCloudinary } = require("./uploadService")
const verificationEmailTemplate = require("../templates/verificationEmail")
const resetPasswordEmailTemplate = require("../templates/resetPasswordEmail")

const hashRefreshToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email })
    if (existingUser) throw new AppError("Email already registered", 409)

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
    const verificationToken = generateRandomToken()
    user.verificationToken = hashToken(verificationToken)
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`
    console.log("Verification Link:", verificationLink)
    await sendEmail({
        to: user.email,
        subject: "Verify Your Email",
        html: verificationEmailTemplate(user.name, verificationLink)
    })

    return user
}

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email })
    if (!user) throw new AppError("Invalid Credentials", 401)
    if (!user.isVerified) throw new AppError("Please verify your email before logging in", 403)
    if (!await bcrypt.compare(password, user.password)) throw new AppError("Invalid Credentials", 401)

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    if (user.refreshTokens.length >= 5) user.refreshTokens.shift()
    user.refreshTokens.push({ token: hashRefreshToken(refreshToken) })
    await user.save()

    return { user, accessToken, refreshToken }
}

const getUserForRefreshToken = async (refreshToken, invalidTokenMessage) => {
    let decoded
    try {
        decoded = jwt.verify(refreshToken, config.jwtSecret)
    } catch (error) {
        throw new AppError(invalidTokenMessage, 401)
    }

    const user = await User.findById(decoded.id)
    if (!user) throw new AppError("User not found", 404)

    return user
}

const refreshToken = async ({ refreshToken }) => {
    if (!refreshToken) throw new AppError("Refresh token missing", 401)

    const user = await getUserForRefreshToken(refreshToken, "Invalid or expired refresh token")
    const hashedRefreshToken = hashRefreshToken(refreshToken)
    const tokenExists = user.refreshTokens.some((token) => token.token === hashedRefreshToken)
    if (!tokenExists) throw new AppError("Refresh token not recognized", 401)

    user.refreshTokens = user.refreshTokens.filter((token) => token.token !== hashedRefreshToken)
    const accessToken = generateAccessToken(user._id)
    const newRefreshToken = generateRefreshToken(user._id)
    user.refreshTokens.push({ token: hashRefreshToken(newRefreshToken) })
    await user.save()

    return { accessToken, refreshToken: newRefreshToken }
}

const logoutUser = async ({ refreshToken }) => {
    if (!refreshToken) return

    try {
        const decoded = jwt.verify(refreshToken, config.jwtSecret)
        const user = await User.findById(decoded.id)
        if (user) {
            const hashedRefreshToken = hashRefreshToken(refreshToken)
            user.refreshTokens = user.refreshTokens.filter((token) => token.token !== hashedRefreshToken)
            await user.save()
        }
    } catch (error) {
        // Ignore invalid token and continue logout
    }
}

const logoutAllDevices = async ({ refreshToken }) => {
    if (!refreshToken) throw new AppError("Refresh token missing", 401)

    const user = await getUserForRefreshToken(refreshToken, "Invalid refresh token")
    user.refreshTokens = []
    await user.save()
}

const verifyEmail = async ({ token }) => {
    const user = await User.findOne({
        verificationToken: hashToken(token),
        verificationExpires: { $gt: new Date() }
    })
    if (!user) throw new AppError("Invalid or expired verification token", 400)

    user.isVerified = true
    user.verificationToken = null
    user.verificationExpires = null
    await user.save()
}

const forgotPassword = async ({ email }) => {
    const user = await User.findOne({ email })
    if (!user) throw new AppError("User not found", 404)

    const resetToken = generateRandomToken()
    user.passwordResetToken = hashToken(resetToken)
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: resetPasswordEmailTemplate(user.name, resetLink)
    })
}

const resetPassword = async ({ token, password }) => {
    const user = await User.findOne({
        passwordResetToken: hashToken(token),
        passwordResetExpires: { $gt: new Date() }
    })
    if (!user) throw new AppError("Invalid or expired reset token", 400)

    user.password = await bcrypt.hash(password, 10)
    user.passwordResetToken = null
    user.passwordResetExpires = null
    user.passwordChangedAt = new Date()
    await user.save()
}

const uploadProfileImage = async ({ userId, file }) => {
    if (!file) throw new AppError("Please upload an image", 400)

    const result = await uploadToCloudinary(file.buffer, "forgeops/profile-images")
    const user = await User.findById(userId)
    user.profileImage = { publicId: result.public_id, url: result.secure_url }
    await user.save()

    return user.profileImage
}

module.exports = { registerUser, loginUser, refreshToken, logoutUser, logoutAllDevices, verifyEmail, forgotPassword, resetPassword, uploadProfileImage }
