const request = require("supertest");
const app = require("../../app");

async function registerUser(overrides = {}) {
  const userData = {
    name: "Sagar",
    email: "sagar@test.com",
    password: "Password123",
    ...overrides,
  };

  const response = await request(app)
    .post("/register")
    .send(userData);

  return {
    response,
    userData,
  };
}


const { sendEmail } = require("../../services/emailService");

function getLastEmail() {
  return sendEmail.mock.calls[
    sendEmail.mock.calls.length - 1
  ][0];
}

module.exports = {
  registerUser,
  getLastEmail,
};