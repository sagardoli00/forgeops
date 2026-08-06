const request = require("supertest");

jest.mock("../../services/emailService");

const app = require("../../app");
const User = require("../../models/user");
const { sendEmail } = require("../../services/emailService");
const { registerUser } = require("../helpers/registerHelper");

require("../helpers/setup");

describe("POST /forgot-password", () => {
  test("should send a password reset email", async () => {
    const { userData } = await registerUser();

    const res = await request(app)
      .post("/forgot-password")
      .send({
        email: userData.email,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    expect(sendEmail).toHaveBeenCalledTimes(2);

    const user = await User.findOne({
      email: userData.email,
    });

    expect(user.passwordResetToken).toBeTruthy();
    expect(user.passwordResetExpires).toBeTruthy();
  });
}); 
test("should reject an unknown email", async () => {
  const res = await request(app)
    .post("/forgot-password")
    .send({
      email: "unknown@test.com",
    });

  expect(res.status).toBe(404);
  expect(res.body.success).toBe(false);
});