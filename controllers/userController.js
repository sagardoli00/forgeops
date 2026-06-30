const User = require("../models/user")

const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken")

async function registerUser(req, res) {

    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
    name,
    email,
    password: hashedPassword
})

await user.save()

res.send("User Registered Successfully")

}



async function loginUser(req, res) {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
    return res.status(401).send("Invalid Credentials")
}
    const isMatch = await bcrypt.compare(password, user.password)

if (!isMatch) {
    return res.status(401).send("Invalid Credentials")
}

    const token = jwt.sign(
    {
        id: user._id
    },
   process.env.JWT_SECRET,
    {
    expiresIn: "1d"
    }
)

res.json({
    message: "Login Successful",
    token
})

}

module.exports = {

    registerUser,
    loginUser
}
