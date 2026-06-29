const mongoose = require("mongoose");

const homeSlideSchema = new mongoose.Schema(
    {
        text1: {
            type: String,
            required: true,
            trim: true,
        },
        text2: {
            type: String,
            required: true,
            trim: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        imagePublicId: {
            type: String,
            default: "",
        },
        displayOrder: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("HomeSlide", homeSlideSchema);
