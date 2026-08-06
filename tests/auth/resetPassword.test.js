const request = require("supertest");
const crypto = require("crypto");

jest.mock("../../services/emailService");

const app = require("../../app");
const User = require("../../models/user");

const {
  getLastEmail,
  getTokenFromEmail,
} = require("../helpers/emailHelper");

const {
  resetUserPassword,
} = require("../helpers/passwordResetHelper");

const { registerUser } = require("../helpers/registerHelper");

require("../helpers/setup");

describe("POST /reset-password", () => {
  test("should reset the password successfully", async () => {
    const {
      response: res,
      userData,
    } = await resetUserPassword();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({
      email: userData.email,
    });

    expect(user.passwordResetToken).toBeNull();
    expect(user.passwordResetExpires).toBeNull();
    expect(user.passwordChangedAt).toBeTruthy();
  });

  test("should reject an invalid reset token", async () => {
    const res = await request(app)
      .post("/reset-password")
      .send({
        token: "invalid-reset-token",
        password: "NewPassword123",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should reject an expired reset token", async () => {
    const { userData } = await registerUser();

    const user = await User.findOne({
      email: userData.email,
    });

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update("expired-token")
      .digest("hex");

    user.passwordResetExpires = new Date(
      Date.now() - 60 * 1000
    );

    await user.save();

    const res = await request(app)
      .post("/reset-password")
      .send({
        token: "expired-token",
        password: "NewPassword123",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should allow login with the new password after reset", async () => {
    const { userData } = await registerUser();

    await request(app)
      .post("/forgot-password")
      .send({
        email: userData.email,
      });

    const token = getTokenFromEmail(
      getLastEmail()
    );

    await request(app)
      .post("/reset-password")
      .send({
        token,
        password: "NewPassword123",
      });

    const user = await User.findOne({
      email: userData.email,
    });

    user.isVerified = true;
    await user.save();

    const res = await request(app)
      .post("/login")
      .send({
        email: userData.email,
        password: "NewPassword123",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});