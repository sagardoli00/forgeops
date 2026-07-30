const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["Todo", "In Progress", "Completed"],
            default: "Todo"
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },

        dueDate: {
            type: Date
        },

        tags: [
            {
                type: String,
                trim: true
            }
        ],

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Project", projectSchema)