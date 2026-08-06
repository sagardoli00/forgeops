const request = require("supertest");

jest.mock("../../services/emailService");

const app = require("../../app");
const User = require("../../models/user");
const { sendEmail } = require("../../services/emailService");
const { registerUser } = require("../helpers/registerHelper");
const {
  getLastEmail,
  getTokenFromEmail,
} = require("../helpers/emailHelper");


require("../helpers/setup");

describe("POST /verify-email", () => {
  test("should verify a user's email successfully", async () => {
    // Register user
    const { userData } = await registerUser();

    // Email should have been "sent"
    expect(sendEmail).toHaveBeenCalledTimes(1);

const emailData = getLastEmail();
const token = getTokenFromEmail(emailData);

    // Verify email
    const res = await request(app)
      .post("/verify-email")
      .send({
        token,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify database updated
    const user = await User.findOne({
      email: userData.email,
    });

    expect(user.isVerified).toBe(true);
    expect(user.verificationToken).toBeNull();
    expect(user.verificationExpires).toBeNull();
  });
});

test("should reject an invalid verification token", async () => {
  const res = await request(app)
    .post("/verify-email")
    .send({
      token: "this-is-an-invalid-token",
    });

  expect(res.status).toBe(400);
  expect(res.body.success).toBe(false);
});

