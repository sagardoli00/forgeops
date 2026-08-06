const mongoose = require("mongoose");

async function clearDatabase() {
  console.log("Connection State:", mongoose.connection.readyState);

  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

module.exports = { clearDatabase };