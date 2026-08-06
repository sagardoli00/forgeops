const request = require("supertest");

jest.mock("../../services/emailService");

const app = require("../../app");
const User = require("../../models/user");

require("../helpers/setup");

test("should refresh the access token", async () => {
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

  // Refresh
  const refreshRes = await request(app)
    .post("/refresh")
    .set("Cookie", cookies);

  expect(refreshRes.status).toBe(200);

  expect(refreshRes.body.success).toBe(true);

  expect(refreshRes.body.accessToken).toBeDefined();
});

test("should reject refresh without a cookie", async () => {
  const res = await request(app)
    .post("/refresh");

  expect(res.status).toBe(401);

  expect(res.body.success).toBe(false);

  expect(res.body.message).toBe("Refresh token missing");
});