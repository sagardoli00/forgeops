const asyncHandler = require("../utils/asyncHandler")
const userService = require("../services/userService")

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const clearRefreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
}

const registerUser = asyncHandler(async (req, res) => {
    const user = await userService.registerUser(req.body)
    res.status(201).json({
        success: true,
        message: "User Registered Successfully",
        user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified }
    })
})

const loginUser = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await userService.loginUser(req.body)
    res.cookie("refreshToken", refreshToken, refreshCookieOptions)
    res.status(200).json({
        success: true,
        message: "Login Successful",
        accessToken,
        user: { id: user._id, name: user.name, email: user.email }
    })
})

const refreshToken = asyncHandler(async (req, res) => {
    const result = await userService.refreshToken({ refreshToken: req.cookies.refreshToken })
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions)
    res.status(200).json({ success: true, message: "Token refreshed successfully", accessToken: result.accessToken })
})

const logoutUser = asyncHandler(async (req, res) => {
    await userService.logoutUser({ refreshToken: req.cookies.refreshToken })
    res.clearCookie("refreshToken", clearRefreshCookieOptions)
    res.status(200).json({ success: true, message: "Logged out successfully" })
})

const logoutAllDevices = asyncHandler(async (req, res) => {
    await userService.logoutAllDevices({ refreshToken: req.cookies.refreshToken })
    res.clearCookie("refreshToken", clearRefreshCookieOptions)
    res.status(200).json({ success: true, message: "Logged out from all devices successfully" })
})

const verifyEmail = asyncHandler(async (req, res) => {
    await userService.verifyEmail(req.body)
    res.status(200).json({ success: true, message: "Email verified successfully" })
})

const forgotPassword = asyncHandler(async (req, res) => {
    await userService.forgotPassword(req.body)
    res.status(200).json({ success: true, message: "Password reset email sent" })
})

const resetPassword = asyncHandler(async (req, res) => {
    await userService.resetPassword(req.body)
    res.status(200).json({ success: true, message: "Password reset successfully" })
})

const getProfile = (req, res) => {
    res.json({ success: true, user: req.user })
}

const uploadProfileImage = asyncHandler(async (req, res) => {
    const profileImage = await userService.uploadProfileImage({ userId: req.user.id, file: req.file })
    res.status(200).json({ success: true, message: "Profile image uploaded successfully", profileImage })
})

module.exports = { registerUser, loginUser, refreshToken, logoutUser, logoutAllDevices, verifyEmail, forgotPassword, resetPassword, getProfile, uploadProfileImage }
