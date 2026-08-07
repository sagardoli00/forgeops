
const request = require("supertest");

jest.mock("../../services/emailService");

const app = require("../../app");
const { loginUser } = require("../helpers/loginHelper");

require("../helpers/setup");

test("owner should invite a member", async () => {
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
        .post(`/organizations/${organizationId}/invite`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            email: "newmember@test.com",
            role: "Member"
        });

    console.log("STATUS:", res.status);
    console.log("BODY:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.invitation.email).toBe("newmember@test.com");
    expect(res.body.invitation.status).toBe("Pending");
});

test("non member should not invite users", async () => {
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
        .post(`/organizations/${organizationId}/invite`)
        .set("Authorization", `Bearer ${anotherUserToken}`)
        .send({
            email: "newmember@test.com",
            role: "Member"
        });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
});

test("should return 400 for invalid organization id", async () => {
    const { accessToken } = await loginUser();

    const res = await request(app)
        .post("/organizations/invalid-id/invite")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            email: "newmember@test.com",
            role: "Member"
        });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
});

const mongoose = require("mongoose");

test("should return 404 when organization does not exist", async () => {
    const { accessToken } = await loginUser();

    const organizationId = new mongoose.Types.ObjectId();

    const res = await request(app)
        .post(`/organizations/${organizationId}/invite`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            email: "newmember@test.com",
            role: "Member"
        });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
});

test("should not send duplicate invitation", async () => {
    const { accessToken } = await loginUser();

    const createRes = await request(app)
        .post("/organizations")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            name: "ForgeOps",
            description: "Engineering Platform"
        });

    const organizationId = createRes.body.organization._id;

    await request(app)
        .post(`/organizations/${organizationId}/invite`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            email: "newmember@test.com",
            role: "Member"
        });

    const res = await request(app)
        .post(`/organizations/${organizationId}/invite`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
            email: "newmember@test.com",
            role: "Member"
        });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
});