const { body, param } = require("express-validator");

const createOrganizationValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Organization name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Organization name must be between 3 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters")
];

const getOrganizationMembersValidator = [
    param("organizationId")
        .isMongoId()
        .withMessage("Invalid organization id")
];

const inviteMemberValidator = [
    param("organizationId")
        .isMongoId()
        .withMessage("Invalid organization id"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),

    body("role")
        .optional()
        .isIn(["Owner", "Admin", "Member"])
        .withMessage("Invalid role")
];

const acceptInvitationValidator = [
    body("token")
        .trim()
        .notEmpty()
        .withMessage("Invitation token is required")
];

const rejectInvitationValidator = [
    body("token")
        .trim()
        .notEmpty()
        .withMessage("Invitation token is required")
];

const changeMemberRoleValidator = [
    param("organizationId")
        .isMongoId()
        .withMessage("Invalid organization id"),

    param("memberId")
        .isMongoId()
        .withMessage("Invalid member id"),

    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["Owner", "Admin", "Member"])
        .withMessage("Invalid role")
];

const removeMemberValidator = [
    param("organizationId")
        .isMongoId()
        .withMessage("Invalid organization id"),

    param("memberId")
        .isMongoId()
        .withMessage("Invalid member id")
];

module.exports = {
    createOrganizationValidator,
    getOrganizationMembersValidator,
    inviteMemberValidator,
    acceptInvitationValidator,
    rejectInvitationValidator,
    changeMemberRoleValidator,
    removeMemberValidator      
};