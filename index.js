const express = require("express")
const mongoose = require("mongoose")
const userRoutes = require("./routes/userRoutes")

const app = express()

mongoose
  .connect("mongodb://127.0.0.1:27017/forgeops")
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

app.listen(3000, () => {
    console.log("ForgeOps server is running on port 3000")
})