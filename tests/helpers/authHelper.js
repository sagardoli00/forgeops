const request = require("supertest");

const app = require("../../app");
const User = require("../../models/user");

async function createVerifiedUser(overrides = {}) {
  const userData = {
    name: "Sagar",
    email: "sagar@test.com",
    password: "Password123",
    ...overrides,
  };

  await request(app)
    .post("/register")
    .send(userData);

  const user = await User.findOne({
    email: userData.email,
  });

  user.isVerified = true;

  await user.save();

  return {
    user,
    userData,
  };
}

module.exports = {
  createVerifiedUser,
};
