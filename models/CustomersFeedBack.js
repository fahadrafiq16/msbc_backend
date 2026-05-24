const mongoose = require("mongoose");

const customersFeedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        trim: true,
        default: ""
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    testimonial: {
        type: String,
        required: true,
        trim: true
    },
    trainingType: {
        type: String,
        trim: true,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
    imagePublicId: {
        type: String,
        default: ""
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model("CustomersFeedBack", customersFeedbackSchema);










