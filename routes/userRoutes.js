const express = require("express");

const {
    registerUser,
    loginUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const {
    validateRegister,
    validateLogin
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
    "/login",
    validateLogin,
    handleValidationErrors,
    loginUser
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