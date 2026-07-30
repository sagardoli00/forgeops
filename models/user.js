const mongoose = require("mongoose")

const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        _id: false
    }
)

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    refreshTokens: {
    type: [refreshTokenSchema],
    default: []
    },

    isVerified: {
    type: Boolean,
    default: false
},

verificationToken: {
    type: String,
    default: null
},

verificationExpires: {
    type: Date,
    default: null
},

passwordResetToken: {
    type: String,
    default: null
},

passwordResetExpires: {
    type: Date,
    default: null
},

passwordChangedAt: {
    type: Date,
    default: null
}


})

const User = mongoose.model("user", userSchema)

module.exports = User