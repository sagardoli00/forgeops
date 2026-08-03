const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const {
    generateRandomToken,
    hashToken
} = require("../utils/security");

const {
    sendEmail
} = require("../services/emailService");

const verificationEmailTemplate = require("../templates/verificationEmail");

const resetPasswordEmailTemplate = require("../templates/resetPasswordEmail");

const {
    generateAccessToken,
    generateRefreshToken
} = require("../utils/token");

const User = require("../models/user");
const config = require("../config/config");
const AppError = require("../utils/AppError");
const { uploadToCloudinary } = require("../services/uploadService");

async function registerUser(req, res) {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    const verificationToken = generateRandomToken();

     user.verificationToken = hashToken(verificationToken);

     user.verificationExpires = new Date(
     Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save();

   const verificationLink =
    `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    console.log("Verification Link:", verificationLink);
     await sendEmail({
       to: user.email,
       subject: "Verify Your Email",
       html: verificationEmailTemplate(
        user.name,
        verificationLink
    )
   });

    res.status(201).json({
        success: true,
        message: "User Registered Successfully",
        user: {
              id: user._id,
              name: user.name,
              email: user.email,
              isVerified: user.isVerified
              }
    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("Invalid Credentials", 401);
    }

    if (!user.isVerified) {
    throw new AppError(
        "Please verify your email before logging in",
        403
    );
}

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid Credentials", 401);
    }

    
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

  
    const hashedRefreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    if (user.refreshTokens.length >= 5) {
       user.refreshTokens.shift(); 
    }
       user.refreshTokens.push({
       token: hashedRefreshToken
    });

    await user.save();

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

   
    res.status(200).json({
        success: true,
        message: "Login Successful",
        accessToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
}

async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError("Refresh token missing", 401);
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, config.jwtSecret);
    } catch (error) {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    const hashedRefreshToken = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const tokenExists = user.refreshTokens.some(
        (token) => token.token === hashedRefreshToken
    );

    if (!tokenExists) {
        throw new AppError("Refresh token not recognized", 401);
    }

    user.refreshTokens = user.refreshTokens.filter(
        (token) => token.token !== hashedRefreshToken
    );

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    const newHashedRefreshToken = crypto
        .createHash("sha256")
        .update(newRefreshToken)
        .digest("hex");

    user.refreshTokens.push({
        token: newHashedRefreshToken
    });

    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken
    });
}

async function logoutUser(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, config.jwtSecret);

        const hashedRefreshToken = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        const user = await User.findById(decoded.id);

        if (user) {
            user.refreshTokens = user.refreshTokens.filter(
                (token) => token.token !== hashedRefreshToken
            );

            await user.save();
        }
    } catch (error) {
        // Ignore invalid token and continue logout
    }

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

async function logoutAllDevices(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError("Refresh token missing", 401);
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, config.jwtSecret);
    } catch (error) {
        throw new AppError("Invalid refresh token", 401);
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.refreshTokens = [];

    await user.save();

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    res.status(200).json({
        success: true,
        message: "Logged out from all devices successfully"
    });
}

async function verifyEmail(req, res) {
    const { token } = req.body;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
        verificationToken: hashedToken,
        verificationExpires: { $gt: new Date() }
    });

    if (!user) {
        throw new AppError("Invalid or expired verification token", 400);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Email verified successfully"
    });
}

async function forgotPassword(req, res) {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const resetToken = generateRandomToken();

    user.passwordResetToken = hashToken(resetToken);

    user.passwordResetExpires = new Date(
        Date.now() + 60 * 60 * 1000
    );

    await user.save();

    const resetLink =
        `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        html: resetPasswordEmailTemplate(
            user.name,
            resetLink
        )
    });

    res.status(200).json({
        success: true,
        message: "Password reset email sent"
    });
}

async function resetPassword(req, res) {

    const { token, password } = req.body;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: new Date()
        }
    });

    if (!user) {
        throw new AppError(
            "Invalid or expired reset token",
            400
        );
    }

    user.password = await bcrypt.hash(password, 10);

    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    user.passwordChangedAt = new Date();

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successfully"
    });
}

async function uploadProfileImage(req, res) {
    if (!req.file) {
        throw new AppError("Please upload an image", 400);
    }

    const result = await uploadToCloudinary(
        req.file.buffer,
        "forgeops/profile-images"
    );

    const user = await User.findById(req.user._id);

    user.profileImage = {
        publicId: result.public_id,
        url: result.secure_url
    };

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        profileImage: user.profileImage
    });
}

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    logoutAllDevices,
    verifyEmail,
    forgotPassword,
    resetPassword,
    uploadProfileImage,
};