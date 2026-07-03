const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }

})

module.exports = mongoose.model("project", projectSchema)