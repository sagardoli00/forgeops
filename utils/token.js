const jwt = require("jsonwebtoken");
const config = require("../config/config");

function generateAccessToken(userId) {
    return jwt.sign(
        { id: userId },
        config.jwtSecret,
        {
            expiresIn: "15m"
        }
    );
}

function generateRefreshToken(userId) {
    return jwt.sign(
        { id: userId },
        config.jwtSecret,
        {
            expiresIn: "7d"
        }
    );
}



module.exports = {
    generateAccessToken,
    generateRefreshToken
};