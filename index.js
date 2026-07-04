require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const projectRoutes = require("./routes/projectRoutes")
const errorMiddleware = require("./middleware/errorMiddleware")
const loggerMiddleware = require("./middleware/loggerMiddleware")
const config = require("./config/config")

const app = express()

  mongoose.connect(config.mongoUri)
  .then(() => {
    console.log("✅ Connected to MongoDB")
  })
  .catch((err) => {
    console.log(err)
  })

  app.use(express.json())
  
  app.use(loggerMiddleware)
  app.use(userRoutes)
  app.use(projectRoutes)


app.get("/", (req, res) => {
    res.send("Welcome to ForgeOps")
})

app.use(errorMiddleware)

app.listen(config.port, () => {
    console.log(`ForgeOps server is running on port ${process.env.PORT}`)
})