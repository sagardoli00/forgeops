const { body, validationResult } = require("express-validator")

const validateProject = [

    body("title")
        .notEmpty()
        .withMessage("Title is required")
        .isString()
        .withMessage("Title must be a string")
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be between 3 and 100 characters"),

    body("description")
        .notEmpty()
        .withMessage("Description is required")
        .isString()
        .withMessage("Description must be a string")
        .isLength({ min: 10, max: 500 })
        .withMessage("Description must be between 10 and 500 characters")

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
    handleValidationErrors
}