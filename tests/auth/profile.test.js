const request = require("supertest");

jest.mock("../../services/emailService");

const app = require("../../app");
const User = require("../../models/user");
const { loginUser } = require("../helpers/loginHelper");

require("../helpers/setup");

describe("GET /profile", () => {
  test("should return the authenticated user's profile", async () => {
    const { accessToken, userData } = await loginUser();

    const dbUser = await User.findOne({
      email: userData.email,
    });

    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.id).toBe(dbUser._id.toString());
  });

  test("should reject request without an access token", async () => {
    const res = await request(app)
      .get("/profile");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Access Denied");
  });

  test("should reject an invalid access token", async () => {
    const res = await request(app)
      .get("/profile")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid Token");
  });
});