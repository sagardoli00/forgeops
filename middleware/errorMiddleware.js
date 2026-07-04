
const config = require("../config/config");
const AppError = require("../utils/AppError");

function errorMiddleware(err, req, res, next) {

    if (config.environment === "development") {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            stack: err.stack
        });
    }

    return res.status(err.statusCode || 500).json({
    success: false,
    message: err instanceof require("../utils/AppError")
        ? err.message
        : "Internal Server Error"
});
}

module.exports = errorMiddleware;