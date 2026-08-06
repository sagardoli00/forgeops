require("dotenv").config();

const mongoose = require("mongoose");

const app = require("./app");
const config = require("./config/config");

async function startServer() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("✅ Connected to MongoDB");

    app.listen(config.port, () => {
      console.log(`ForgeOps server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB");
    console.error(err);
    process.exit(1);
  }
}

startServer();