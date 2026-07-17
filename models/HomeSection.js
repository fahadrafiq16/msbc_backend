const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema(
    {
        imageUrl: { type: String, default: "", trim: true },
        imagePublicId: { type: String, default: "", trim: true },
        linkUrl: { type: String, default: "", trim: true },
        displayOrder: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const footerLinkSchema = new mongoose.Schema(
    {
        title: { type: String, default: "", trim: true },
        url: { type: String, default: "", trim: true },
        displayOrder: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const socialLinkSchema = new mongoose.Schema(
    {
        platform: { type: String, default: "", trim: true },
        url: { type: String, default: "", trim: true },
    },
    { _id: false }
);

const homeSectionSchema = new mongoose.Schema(
    {
        sectionKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        title: {
            type: String,
            default: "",
            trim: true,
        },
        bodyText: {
            type: String,
            default: "",
            trim: true,
        },
        buttonLabel: {
            type: String,
            default: "",
            trim: true,
        },
        buttonUrl: {
            type: String,
            default: "",
            trim: true,
        },
        youtubeEmbedUrl: {
            type: String,
            default: "",
            trim: true,
        },
        bannerImageUrl: {
            type: String,
            default: "",
            trim: true,
        },
        bannerImagePublicId: {
            type: String,
            default: "",
            trim: true,
        },
        leftImageUrl: {
            type: String,
            default: "",
            trim: true,
        },
        leftImagePublicId: {
            type: String,
            default: "",
            trim: true,
        },
        rightImageUrl: {
            type: String,
            default: "",
            trim: true,
        },
        rightImagePublicId: {
            type: String,
            default: "",
            trim: true,
        },
        photosButtonUrl: {
            type: String,
            default: "",
            trim: true,
        },
        videosButtonUrl: {
            type: String,
            default: "",
            trim: true,
        },
        galleryItems: {
            type: [galleryItemSchema],
            default: [],
        },
        footerColumn1Title: { type: String, default: "", trim: true },
        footerColumn1Links: { type: [footerLinkSchema], default: [] },
        footerColumn4Title: { type: String, default: "", trim: true },
        footerColumn4Links: { type: [footerLinkSchema], default: [] },
        footerLogoImageUrl: { type: String, default: "", trim: true },
        footerLogoImagePublicId: { type: String, default: "", trim: true },
        footerLegalText: { type: String, default: "", trim: true },
        facebookPageUrl: { type: String, default: "", trim: true },
        socialLinks: { type: [socialLinkSchema], default: [] },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("HomeSection", homeSectionSchema);
