const request = require("supertest");

jest.mock("../../services/emailService");

const app = require("../../app");
const User = require("../../models/user");

require("../helpers/setup");

test("should logout successfully", async () => {
  const userData = {
    name: "Sagar",
    email: "sagar@test.com",
    password: "Password123",
  };

  // Register
  await request(app)
    .post("/register")
    .send(userData);

  // Verify user
  const user = await User.findOne({
    email: userData.email,
  });

  user.isVerified = true;
  await user.save();

  // Login
  const loginRes = await request(app)
    .post("/login")
    .send({
      email: userData.email,
      password: userData.password,
    });

  const cookies = loginRes.headers["set-cookie"];

  // Logout
  const logoutRes = await request(app)
    .post("/logout")
    .set("Cookie", cookies);

  expect(logoutRes.status).toBe(200);

  expect(logoutRes.body.success).toBe(true);

  // Verify refresh token removed
  const updatedUser = await User.findOne({
    email: userData.email,
  });

  expect(updatedUser.refreshTokens.length).toBe(0);
});