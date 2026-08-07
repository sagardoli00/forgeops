const Organization = require("../models/organization");
const Membership = require("../models/membership");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const Invitation = require("../models/invitation");
const User = require("../models/user");
const { sendOrganizationInvitationEmail } = require("./emailService");

const createOrganization = async ({ name, description, userId }) => {
    const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

    const existingOrganization = await Organization.findOne({ slug });

    if (existingOrganization) {
        throw new AppError("Organization slug already exists", 409);
    }

    const organization = await Organization.create({
        name,
        slug,
        description,
        createdBy: userId,
    });

    await Membership.create({
        user: userId,
        organization: organization._id,
        role: "Owner",
    });

    return organization;
};

const getOrganizationMembers = async ({ organizationId, userId }) => {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
        throw new AppError("Organization not found", 404);
    }

    const membership = await Membership.findOne({
        organization: organizationId,
        user: userId,
    });

    if (!membership) {
        throw new AppError("Forbidden", 403);
    }

    const members = await Membership.find({
        organization: organizationId,
    })
        .populate("user", "name email profileImage")
        .sort({ createdAt: 1 });

    return members;
};


const inviteMember = async ({
    organizationId,
    userId,
    email,
    role
}) => {

    const organization = await Organization.findById(organizationId);

    if (!organization) {
        throw new AppError("Organization not found", 404);
    }

    const inviterMembership = await Membership.findOne({
        organization: organizationId,
        user: userId
    });

    if (!inviterMembership) {
        throw new AppError("Forbidden", 403);
    }

    if (
        inviterMembership.role !== "Owner" &&
        inviterMembership.role !== "Admin"
    ) {
        throw new AppError("Only owner or admin can invite members", 403);
    }

    const invitedUser = await User.findOne({ email });

    if (invitedUser) {
       const existingMembership = await Membership.findOne({
         organization: organizationId,
         user: invitedUser._id
    });

    if (existingMembership) {
        throw new AppError("User is already a member", 409);
    }
}

    const existingInvitation = await Invitation.findOne({
        organization: organizationId,
        email,
        status: "Pending"
    });

    if (existingInvitation) {
        throw new AppError("Invitation already sent", 409);
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invitation = await Invitation.create({
        organization: organizationId,
        invitedBy: userId,
        email,
        role,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    });

    await sendOrganizationInvitationEmail({
        email,
        organizationName: organization.name,
        token
    });

    return invitation;
};

const acceptInvitation = async ({ token, userId }) => {

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
        throw new AppError("Invitation not found", 404);
    }

    if (invitation.status !== "Pending") {
        throw new AppError("Invitation is no longer valid", 400);
    }

    if (invitation.expiresAt < new Date()) {
        throw new AppError("Invitation has expired", 400);
    }

    const existingMembership = await Membership.findOne({
        organization: invitation.organization,
        user: userId
    });

    if (existingMembership) {
        throw new AppError("User is already a member", 409);
    }

    const membership = await Membership.create({
        organization: invitation.organization,
        user: userId,
        role: invitation.role
    });

    invitation.status = "Accepted";
    await invitation.save();

    return membership;
};

const rejectInvitation = async ({ token }) => {

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
        throw new AppError("Invitation not found", 404);
    }

    if (invitation.status !== "Pending") {
        throw new AppError("Invitation is no longer valid", 400);
    }

    if (invitation.expiresAt < new Date()) {
        throw new AppError("Invitation has expired", 400);
    }

    invitation.status = "Rejected";

    await invitation.save();

    return invitation;
};

const changeMemberRole = async ({
    organizationId,
    memberId,
    userId,
    role
}) => {

    const requesterMembership = await Membership.findOne({
        organization: organizationId,
        user: userId
    });

    if (!requesterMembership) {
        throw new AppError("Forbidden", 403);
    }

    if (requesterMembership.role !== "Owner") {
        throw new AppError("Only the owner can change member roles", 403);
    }

    const member = await Membership.findById(memberId);

    if (!member) {
        throw new AppError("Member not found", 404);
    }

    if (member.organization.toString() !== organizationId) {
        throw new AppError("Member does not belong to this organization", 400);
    }

    member.role = role;

    await member.save();

    return member;
};

const removeMember = async ({
    organizationId,
    memberId,
    userId
}) => {

    const requesterMembership = await Membership.findOne({
        organization: organizationId,
        user: userId
    });

    if (!requesterMembership) {
        throw new AppError("Forbidden", 403);
    }

    if (requesterMembership.role !== "Owner") {
        throw new AppError("Only the owner can remove members", 403);
    }

    const member = await Membership.findById(memberId);

    if (!member) {
        throw new AppError("Member not found", 404);
    }

    if (member.organization.toString() !== organizationId) {
        throw new AppError("Member does not belong to this organization", 400);
    }

    if (member.user.toString() === userId) {
        throw new AppError("Owner cannot remove themselves", 400);
    }

    await member.deleteOne();
};

module.exports = {
    createOrganization,
    getOrganizationMembers,
    inviteMember,
    acceptInvitation,
    rejectInvitation,
    changeMemberRole,
    removeMember
};
