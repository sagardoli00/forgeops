const request = require("supertest");

const app = require("../../app");
const { registerUser } = require("./registerHelper");
const {
  getLastEmail,
  getTokenFromEmail,
} = require("./emailHelper");

async function resetUserPassword(newPassword = "NewPassword123") {
  const { userData } = await registerUser();

  await request(app)
    .post("/forgot-password")
    .send({
      email: userData.email,
    });

  const email = getLastEmail();
  const token = getTokenFromEmail(email);

  const response = await request(app)
    .post("/reset-password")
    .send({
      token,
      password: newPassword,
    });

  return {
    response,
    userData,
    token,
  };
}

module.exports = {
  resetUserPassword,
};