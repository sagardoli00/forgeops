const jwt = require("jsonwebtoken")
const config = require("../config/config")

function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization

if (!authHeader) {
    return res.status(401).send("Access Denied")
}

const token = authHeader.split(" ")[1]
 
   try {

    const decoded = jwt.verify(token, config.jwtSecret)

req.user = decoded

next()

} catch (error) {

    return res.status(401).send("Invalid Token")

}

}

module.exports = authMiddleware