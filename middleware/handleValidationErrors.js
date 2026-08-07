const { validationResult } = require("express-validator");

function validationErrorHandler(options = {}) {
    return function handleValidationErrors(req, res, next) {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        if (options.format === "fields") {
            const formattedErrors = {};
            errors.array().forEach((error) => {
                formattedErrors[error.path] = error.msg;
            });

            return res.status(400).json({ success: false, errors: formattedErrors });
        }

        return res.status(400).json({ success: false, errors: errors.array() });
    };
}

function handleValidationErrors(reqOrOptions, res, next) {
    if (arguments.length === 1) {
        return validationErrorHandler(reqOrOptions);
    }

    return validationErrorHandler()(reqOrOptions, res, next);
}

handleValidationErrors.withOptions = validationErrorHandler;

module.exports = handleValidationErrors;
