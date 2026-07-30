require("dotenv").config()
const cookieParser = require("cookie-parser");
const express = require("express")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")
const projectRoutes = require("./routes/projectRoutes")
const errorMiddleware = require("./middleware/errorMiddleware")
const loggerMiddleware = require("./middleware/loggerMiddleware")
const config = require("./config/config")

const app = express()

 
  app.use(express.json())
  app.use(cookieParser());
  
  app.use(loggerMiddleware)
  app.use(userRoutes)
  app.use(projectRoutes)


app.get("/", (req, res) => {
    res.send("Welcome to ForgeOps")
})

app.use(errorMiddleware)

async function startServer() {
    try {
        await mongoose.connect(config.mongoUri)
        console.log("✅ Connected to MongoDB")

        app.listen(config.port, () => {
            console.log(`ForgeOps server is running on port ${config.port}`)
        })

    } catch (err) {
        console.error("❌ Failed to connect to MongoDB")
        console.error(err)
        process.exit(1)
    }
}

startServer()