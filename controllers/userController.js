const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const config = require("../config/config");
const AppError = require("../utils/AppError");

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

    res.status(201).json({
        success: true,
        message: "User Registered Successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("Invalid Credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid Credentials", 401);
    }

    const token = jwt.sign(
        {
            id: user._id
        },
        config.jwtSecret,
        {
            expiresIn: "1d"
        }
    );

    res.json({
        success: true,
        message: "Login Successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
}

module.exports = {
    registerUser,
    loginUser
};