const { body, validationResult } = require("express-validator")

const validateProject = [

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isString()
        .withMessage("Title must be a string")
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be between 3 and 100 characters"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isString()
        .withMessage("Description must be a string")
        .isLength({ min: 10, max: 500 })
        .withMessage("Description must be between 10 and 500 characters"),

    body("status")
        .optional()
        .isIn(["Todo", "In Progress", "Completed"])
        .withMessage("Invalid status"),

    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High"])
        .withMessage("Invalid priority"),

    body("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid due date"),

    body("tags")
        .optional()
        .isArray()
        .withMessage("Tags must be an array"),

    body("tags.*")
        .optional()
        .trim()
        .isString()
        .withMessage("Each tag must be a string")

]

const validateProjectUpdate = [

    body("title")
        .optional()
        .trim()
        .isString()
        .withMessage("Title must be a string")
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be between 3 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isString()
        .withMessage("Description must be a string")
        .isLength({ min: 10, max: 500 })
        .withMessage("Description must be between 10 and 500 characters"),

    body("status")
        .optional()
        .isIn(["Todo", "In Progress", "Completed"])
        .withMessage("Invalid status"),

    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High"])
        .withMessage("Invalid priority"),

    body("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid due date"),

    body("tags")
        .optional()
        .isArray()
        .withMessage("Tags must be an array"),

    body("tags.*")
        .optional()
        .trim()
        .isString()
        .withMessage("Each tag must be a string")

]

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const formattedErrors = {}

        errors.array().forEach(error => {
            formattedErrors[error.path] = error.msg
        })

        return res.status(400).json({
            success: false,
            errors: formattedErrors
        })
    }

    next()
}

module.exports = {
    validateProject,
    validateProjectUpdate,
    handleValidationErrors
}