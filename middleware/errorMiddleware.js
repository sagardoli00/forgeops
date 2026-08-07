const config = require("../config/config");
const AppError = require("../utils/AppError");

function errorMiddleware(err, req, res, next) {

    console.error("===== ERROR DEBUG =====");
    console.error("Constructor:", err.constructor.name);
    console.error("Instance of AppError:", err instanceof AppError);
    console.error("Status Code:", err.statusCode);
    console.error("Message:", err.message);
    console.error("Stack:");
    console.error(err.stack);
    console.error("=======================");

    if (config.environment === "development") {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message,
            stack: err.stack
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}

module.exports = errorMiddleware;
