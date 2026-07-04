const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

function validateObjectId(req, res, next) {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Project ID", 400));
    }

    next();
}

module.exports = validateObjectId;