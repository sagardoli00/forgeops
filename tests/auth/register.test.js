const request = require("supertest");
const bcrypt = require("bcrypt");

jest.mock("../../services/emailService");

const app = require("../../app");
const User = require("../../models/user");
require("../helpers/setup");

describe("POST /register", () => {
  test("should register a new user successfully", async () => {
    const userData = {
      name: "Sagar",
      email: "sagar@test.com",
      password: "Password123"
    };

    const res = await request(app)
      .post("/register")
      .send(userData);

    expect(res.status).toBe(201);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User Registered Successfully");

    const user = await User.findOne({
      email: userData.email
    });

    expect(user).not.toBeNull();

    expect(user.name).toBe(userData.name);

    expect(user.password).not.toBe(userData.password);

    const isMatch = await bcrypt.compare(
      userData.password,
      user.password
    );

    expect(isMatch).toBe(true);

    expect(user.isVerified).toBe(false);

    expect(user.verificationToken).toBeTruthy();

    expect(user.verificationExpires).toBeTruthy();
  });
});

test("should reject duplicate email registration", async () => {
  const userData = {
    name: "Sagar",
    email: "sagar@test.com",
    password: "Password123",
  };

  // First registration
  await request(app)
    .post("/register")
    .send(userData);

  // Second registration
  const res = await request(app)
    .post("/register")
    .send(userData);

  expect(res.status).toBe(409);

  expect(res.body.success).toBe(false);
  expect(res.body.message).toBe("Email already registered");
});

test("should reject an invalid email address", async () => {
  const res = await request(app)
    .post("/register")
    .send({
      name: "Sagar",
      email: "not-an-email",
      password: "Password123"
    });

  expect(res.status).toBe(400);

  expect(res.body.success).toBe(false);
});
 test("should reject registration without a password", async () => {
  const res = await request(app)
    .post("/register")
    .send({
      name: "Sagar",
      email: "sagar@test.com",
    });

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});

test("should reject a name shorter than 3 characters", async () => {
  const res = await request(app)
    .post("/register")
    .send({
      name: "AB",
      email: "sagar@test.com",
      password: "Password123",
    });

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});