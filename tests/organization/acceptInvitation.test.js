const request = require("supertest");

jest.mock("../../services/emailService");

const app = require("../../app");
const Invitation = require("../../models/invitation");
const Membership = require("../../models/membership");

const { loginUser } = require("../helpers/loginHelper");

require("../helpers/setup");

test("user should accept invitation", async () => {
    // Owner
    const { accessToken: ownerToken } = await loginUser();

    const createRes = await request(app)
        .post("/organizations")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
            name: "ForgeOps",
            description: "Engineering Platform"
        });

    const organizationId = createRes.body.organization._id;

    // Invite user
    await request(app)
        .post(`/organizations/${organizationId}/invite`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
            email: "member@test.com",
            role: "Member"
        });

    const invitation = await Invitation.findOne({
        email: "member@test.com"
    });

    // Login invited user
    const { accessToken: memberToken, user } = await loginUser({
        email: "member@test.com"
    });

    const res = await request(app)
        .post("/organizations/accept-invitation")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
            token: invitation.token
        });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const membership = await Membership.findOne({
        organization: organizationId,
        user: user._id
    });

    expect(membership).not.toBeNull();

    const updatedInvitation = await Invitation.findById(invitation._id);

    expect(updatedInvitation.status).toBe("Accepted");
});