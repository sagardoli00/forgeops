const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")

const { registerUser, loginUser } = require("../controllers/userController")

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)

router.get("/profile", authMiddleware, (req, res) => {
    res.json(req.user)
})

module.exports = router