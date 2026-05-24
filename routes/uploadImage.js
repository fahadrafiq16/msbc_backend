const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
    },
});

const streamUpload = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image" },
            (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
    });

// POST /api/upload-image  (multipart/form-data, field "image")
router.post("/upload-image", upload.single("image"), async (req, res) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            return res.status(500).json({ success: false, error: "Cloudinary is not configured (missing CLOUDINARY_CLOUD_NAME)" });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No image uploaded (use field name 'image')" });
        }
        const folder = String(req.query.folder || req.body.folder || "msbc/testimonials");
        const result = await streamUpload(req.file.buffer, folder);
        return res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        });
    } catch (err) {
        console.error("[upload-image] failed:", err);
        return res.status(500).json({ success: false, error: err.message || "Upload failed" });
    }
});

module.exports = router;
