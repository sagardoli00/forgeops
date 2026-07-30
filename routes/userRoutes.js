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
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const {
    validateRegister,
    validateLogin,
    validateVerifyEmail,
    validateForgotPassword,
    validateResetPassword
} = require("../validators/userValidator");

const handleValidationErrors = require("../middleware/handleValidationErrors");

const router = express.Router();

router.post(
    "/register",
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
    (req, res) => {
        res.json({
            success: true,
            user: req.user
        });
    }
);

module.exports = router;