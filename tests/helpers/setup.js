const mongoose = require("mongoose");

const config = require("../../config/config");

beforeAll(async () => {
  await mongoose.connect(config.mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});