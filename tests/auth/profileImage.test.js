const path = require("path");
const request = require("supertest");

jest.mock("../../services/emailService");

jest.mock("../../services/uploadService", () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue({
    public_id: "profile-image-123",
    secure_url: "https://cloudinary.com/profile-image.jpg",
  }),
}));

const app = require("../../app");
const User = require("../../models/user");
const { loginUser } = require("../helpers/loginHelper");

require("../helpers/setup");

describe("PATCH /profile-image", () => {
  test("should upload a profile image successfully", async () => {
    const { accessToken, userData } = await loginUser();

    const res = await request(app)
      .patch("/profile-image")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach(
        "profileImage",
        path.join(__dirname, "../fixtures/profile.jpg")
      );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({
      email: userData.email,
    });

    expect(user.profileImage.publicId).toBe(
      "profile-image-123"
    );

    expect(user.profileImage.url).toBe(
      "https://cloudinary.com/profile-image.jpg"
    );
  });

  test("should reject request without an image", async () => {
    const { accessToken } = await loginUser();

    const res = await request(app)
      .patch("/profile-image")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(
      "Please upload an image"
    );
  });

  test("should reject request without authentication", async () => {
    const res = await request(app)
      .patch("/profile-image");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});