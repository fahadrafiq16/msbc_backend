const mongoose = require("mongoose");

const fotosGalleryItemSchema = new mongoose.Schema(
    {
        mediaUrl: { type: String, default: "", trim: true },
        mediaPublicId: { type: String, default: "", trim: true },
        mediaType: { type: String, enum: ["image", "video"], default: "image" },
        displayOrder: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const fotosGallerySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        galleryType: { type: String, enum: ["photos", "videos"], required: true },
        featuredImageUrl: { type: String, default: "", trim: true },
        featuredImagePublicId: { type: String, default: "", trim: true },
        items: { type: [fotosGalleryItemSchema], default: [] },
        displayOrder: { type: Number, default: 0, min: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("FotosGallery", fotosGallerySchema);
