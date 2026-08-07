const organizationService = require("../services/organizationService");
const asyncHandler = require("../utils/asyncHandler");

const createOrganization = asyncHandler(async (req, res) => {
    const organization = await organizationService.createOrganization({
        name: req.body.name,
        description: req.body.description,
        userId: req.user.id
    });

    res.status(201).json({
        success: true,
        message: "Organization created successfully",
        organization
    });
});

const getOrganizationMembers = asyncHandler(async (req, res) => {
    const members = await organizationService.getOrganizationMembers({
        organizationId: req.params.organizationId,
        userId: req.user.id
    });

    res.status(200).json({
        success: true,
        members
    });
});

const inviteMember = asyncHandler(async (req, res) => {
    const invitation = await organizationService.inviteMember({
        organizationId: req.params.organizationId,
        userId: req.user.id,
        email: req.body.email,
        role: req.body.role
    });

    res.status(201).json({
        success: true,
        message: "Invitation sent successfully",
        invitation
    });
});

const acceptInvitation = asyncHandler(async (req, res) => {
    const membership = await organizationService.acceptInvitation({
        token: req.body.token,
        userId: req.user.id
    });

    res.status(200).json({
        success: true,
        message: "Invitation accepted successfully",
        membership
    });
});

const rejectInvitation = asyncHandler(async (req, res) => {
    const invitation = await organizationService.rejectInvitation({
        token: req.body.token
    });

    res.status(200).json({
        success: true,
        message: "Invitation rejected successfully",
        invitation
    });
});

const changeMemberRole = asyncHandler(async (req, res) => {
    const membership = await organizationService.changeMemberRole({
        organizationId: req.params.organizationId,
        memberId: req.params.memberId,
        userId: req.user.id,
        role: req.body.role
    });

    res.status(200).json({
        success: true,
        message: "Member role updated successfully",
        membership
    });
});


const removeMember = asyncHandler(async (req, res) => {
    await organizationService.removeMember({
        organizationId: req.params.organizationId,
        memberId: req.params.memberId,
        userId: req.user.id
    });

    res.status(200).json({
        success: true,
        message: "Member removed successfully"
    });
});

module.exports = {
    createOrganization,
    getOrganizationMembers,
    inviteMember,
    acceptInvitation,
    rejectInvitation,
    changeMemberRole,
    removeMember
};