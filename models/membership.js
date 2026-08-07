const mongoose = require("mongoose")

const membershipSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },

        role: {
            type: String,
            enum: ["Owner", "Admin", "Member"],
            default: "Member",
            required: true
        },

        status: {
            type: String,
            enum: ["Active", "Pending"],
            default: "Active"
        },

        joinedAt: {
            type: Date,
            default: Date.now
        },

        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            default: null
        }
    },
    {
        timestamps: true
    }
)

membershipSchema.index(
    {
        user: 1,
        organization: 1
    },
    {
        unique: true
    }
)

module.exports = mongoose.model("Membership", membershipSchema)