const request = require("supertest");
const mongoose = require("mongoose");

jest.mock("../../services/emailService");

const app = require("../../app");
const { loginUser } = require("../helpers/loginHelper");


require("../helpers/setup");

test("owner should get organization members", async () => {
    const { accessToken } = await loginUser();

    const createRes = await request(app)
        .post("/organizations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            name: "ForgeOps",
            description: "Engineering Platform"
        });

    expect(createRes.status).toBe(201);

    const organizationId = createRes.body.organization._id;

    const res = await request(app)
        .get(`/organizations/${organizationId}/members`)
        .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.members)).toBe(true);
    expect(res.body.members).toHaveLength(1);

    expect(res.body.members[0].role).toBe("Owner");
    expect(res.body.members[0].user.email).toBeDefined();
});

test("non member should not get organization members", async () => {
    const { accessToken: ownerToken } = await loginUser();

    const createRes = await request(app)
        .post("/organizations")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
            name: "ForgeOps",
            description: "Engineering Platform"
        });

    const organizationId = createRes.body.organization._id;

    const { accessToken: anotherUserToken } = await loginUser({
        email: "another@test.com"
    });

    const res = await request(app)
        .get(`/organizations/${organizationId}/members`)
        .set("Authorization", `Bearer ${anotherUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
});

test("should return 400 for invalid organization id", async () => {
    const { accessToken } = await loginUser();

    const res = await request(app)
        .get("/organizations/invalid-id/members")
        .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
});



test("should return 404 when organization does not exist", async () => {
    const { accessToken } = await loginUser();

    const organizationId = new mongoose.Types.ObjectId();

    const res = await request(app)
        .get(`/organizations/${organizationId}/members`)
        .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
});