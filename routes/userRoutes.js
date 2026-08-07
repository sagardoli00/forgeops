const express = require("express");


const {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    logoutAllDevices,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getProfile,
    uploadProfileImage,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    validateRegister,
    validateLogin,
    validateVerifyEmail,
    validateForgotPassword,
    validateResetPassword
} = require("../validators/userValidator");

const handleValidationErrors = require("../middleware/handleValidationErrors");

const router = express.Router();

const { authLimiter } = require("../middleware/rateLimiter");

router.post(
    "/register",
     authLimiter,
    validateRegister,
    handleValidationErrors,
    registerUser
);

router.post(
    "/verify-email",
    validateVerifyEmail,
    handleValidationErrors,
    verifyEmail
);

router.post(
    "/forgot-password",
     authLimiter,
    validateForgotPassword,
    handleValidationErrors,
    forgotPassword
);

router.post(
    "/reset-password",
    validateResetPassword,
    handleValidationErrors,
    resetPassword
);

router.post(
    "/login",
     authLimiter,
    validateLogin,
    handleValidationErrors,
    loginUser
);


router.post(
    "/refresh",
    refreshToken
);

router.post(
    "/logout",
    logoutUser
);

router.post(
    "/logout-all",
    logoutAllDevices
);

router.get(
    "/profile",
    authMiddleware,
    getProfile
);

router.patch(
    "/profile-image",
    authMiddleware,
    upload.single("profileImage"),
    uploadProfileImage
);

module.exports = router;
