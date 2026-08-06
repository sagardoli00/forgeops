const request = require("supertest");
const app = require("../../app");
const { createVerifiedUser } = require("./authHelper");

async function loginUser(userOverrides = {}) {
  const { userData, user } = await createVerifiedUser(userOverrides);

  const res = await request(app)
    .post("/login")
    .send({
      email: userData.email,
      password: userData.password,
    });

  return {
    user,
    userData,
    accessToken: res.body.accessToken,
    cookies: res.headers["set-cookie"],
    response: res,
  };
}

module.exports = {
  loginUser,
};