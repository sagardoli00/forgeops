const express = require("express");

const organizationController = require("../controllers/organizationController");
const authMiddleware = require("../middleware/authMiddleware");
const handleValidationErrors = require("../middleware/handleValidationErrors");
const router = express.Router();

const {
    createOrganizationValidator,
    getOrganizationMembersValidator,
    inviteMemberValidator,
    acceptInvitationValidator,
    rejectInvitationValidator,
    changeMemberRoleValidator,
    removeMemberValidator
} = require("../validators/organizationValidator");


router.post(
    "/",
    authMiddleware,
    createOrganizationValidator,
    handleValidationErrors,
    organizationController.createOrganization
);

router.get(
    "/:organizationId/members",
    authMiddleware,
    getOrganizationMembersValidator,
    handleValidationErrors,
    organizationController.getOrganizationMembers
);

router.post(
    "/:organizationId/invite",
    authMiddleware,
    inviteMemberValidator,
    handleValidationErrors,
    organizationController.inviteMember
);

router.post(
    "/accept-invitation",
    authMiddleware,
    acceptInvitationValidator,
    handleValidationErrors,
    organizationController.acceptInvitation
);

router.post(
    "/reject-invitation",
    authMiddleware,
    rejectInvitationValidator,
    handleValidationErrors,
    organizationController.rejectInvitation
);

router.patch(
    "/:organizationId/members/:memberId/role",
    authMiddleware,
    changeMemberRoleValidator,
    handleValidationErrors,
    organizationController.changeMemberRole
);

router.delete(
    "/:organizationId/members/:memberId",
    authMiddleware,
    removeMemberValidator,
    handleValidationErrors,
    organizationController.removeMember
);

module.exports = router;