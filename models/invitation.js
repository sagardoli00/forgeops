const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
    {
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organization",
            required: true
        },

        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["Owner", "Admin", "Member"],
            default: "Member"
        },

        token: {
            type: String,
            required: true,
            unique: true
        },

        status: {
            type: String,
            enum: ["Pending", "Accepted", "Rejected", "Expired"],
            default: "Pending"
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Invitation = mongoose.model("invitation", invitationSchema);

module.exports = Invitation;