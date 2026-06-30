require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")

const app = express()

  mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB")
  })
  .catch((err) => {
    console.log(err)
  })

  app.use(express.json())
  
  app.use(userRoutes)


app.get("/", (req, res) => {
    res.send("Welcome to ForgeOps")
})

app.listen(process.env.PORT, () => {
    console.log(`ForgeOps server is running on port ${process.env.PORT}`)
})