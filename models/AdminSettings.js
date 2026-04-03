const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        passwordPlain: {
            type: String,
            required: true,
        },
        contactEmail: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);


