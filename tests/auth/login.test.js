const request = require("supertest");
const User = require("../../models/user");

jest.mock("../../services/emailService");

const app = require("../../app");
const { createVerifiedUser } = require("../helpers/authHelper");

require("../helpers/setup");

describe("POST /login", () => {
  test("should reject login with an unknown email", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        email: "unknown@test.com",
        password: "Password123",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid Credentials");
  });

  test("should reject login if email is not verified", async () => {
    const userData = {
      name: "Sagar",
      email: "sagar@test.com",
      password: "Password123",
    };

    await request(app)
      .post("/register")
      .send(userData);

    const res = await request(app)
      .post("/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(
      "Please verify your email before logging in"
    );
  });

  test("should login a verified user successfully", async () => {
    const { userData } = await createVerifiedUser();

    const res = await request(app)
      .post("/login")
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();

    const updatedUser = await User.findOne({
      email: userData.email,
    });

    expect(updatedUser.refreshTokens.length).toBe(1);
    expect(updatedUser.refreshTokens[0].token).toBeTruthy();
  });

  test("should reject login with an incorrect password", async () => {
    const { userData } = await createVerifiedUser();

    const res = await request(app)
      .post("/login")
      .send({
        email: userData.email,
        password: "WrongPassword123",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid Credentials");

    const updatedUser = await User.findOne({
      email: userData.email,
    });

    expect(updatedUser.refreshTokens.length).toBe(0);
  });
});