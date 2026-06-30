const express = require("express");
const FotosGallery = require("../models/FotosGallery");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

function normalizeItems(items, galleryType) {
    if (!Array.isArray(items)) return [];
    const defaultMediaType = galleryType === "videos" ? "video" : "image";
    return items
        .map((item, index) => ({
            mediaUrl: typeof item?.mediaUrl === "string" ? item.mediaUrl.trim() : "",
            mediaPublicId: typeof item?.mediaPublicId === "string" ? item.mediaPublicId.trim() : "",
            mediaType: item?.mediaType === "video" || item?.mediaType === "image" ? item.mediaType : defaultMediaType,
            displayOrder: Number.isFinite(Number(item?.displayOrder)) ? Number(item.displayOrder) : index,
        }))
        .filter((item) => item.mediaUrl)
        .sort((a, b) => a.displayOrder - b.displayOrder);
}

function toPayload(doc) {
    return {
        id: String(doc._id),
        title: doc.title || "",
        galleryType: doc.galleryType,
        featuredImageUrl: doc.featuredImageUrl || "",
        featuredImagePublicId: doc.featuredImagePublicId || "",
        items: doc.items || [],
        displayOrder: doc.displayOrder ?? 0,
        isActive: doc.isActive !== false,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

// GET /api/fotos-galleries — public active galleries
router.get("/fotos-galleries", async (_req, res) => {
    try {
        const galleries = await FotosGallery.find({ isActive: true })
            .sort({ galleryType: 1, displayOrder: 1, createdAt: -1 })
            .lean();
        const photos = galleries.filter((g) => g.galleryType === "photos").map(toPayload);
        const videos = galleries.filter((g) => g.galleryType === "videos").map(toPayload);
        return res.json({ success: true, photos, videos });
    } catch (err) {
        console.error("[fotos-galleries] GET failed:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/fotos-galleries/all — dashboard
router.get("/fotos-galleries/all", authenticateToken, async (_req, res) => {
    try {
        const galleries = await FotosGallery.find().sort({ galleryType: 1, displayOrder: 1, createdAt: -1 }).lean();
        return res.json({ success: true, galleries: galleries.map(toPayload) });
    } catch (err) {
        console.error("[fotos-galleries] GET all failed:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/fotos-galleries — create
router.post("/fotos-galleries", authenticateToken, async (req, res) => {
    try {
        const { title, galleryType, featuredImageUrl, featuredImagePublicId, items, displayOrder, isActive } = req.body || {};
        if (!title?.trim()) {
            return res.status(400).json({ success: false, error: "Title is required" });
        }
        if (!["photos", "videos"].includes(galleryType)) {
            return res.status(400).json({ success: false, error: "galleryType must be photos or videos" });
        }
        const created = await FotosGallery.create({
            title: title.trim(),
            galleryType,
            featuredImageUrl: typeof featuredImageUrl === "string" ? featuredImageUrl.trim() : "",
            featuredImagePublicId: typeof featuredImagePublicId === "string" ? featuredImagePublicId.trim() : "",
            items: normalizeItems(items, galleryType),
            displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
            isActive: isActive !== false,
        });
        return res.status(201).json({ success: true, gallery: toPayload(created.toObject()) });
    } catch (err) {
        console.error("[fotos-galleries] POST failed:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/fotos-galleries/:id — update
router.put("/fotos-galleries/:id", authenticateToken, async (req, res) => {
    try {
        const { title, galleryType, featuredImageUrl, featuredImagePublicId, items, displayOrder, isActive } = req.body || {};
        const updates = {};
        if (typeof title === "string") updates.title = title.trim();
        if (["photos", "videos"].includes(galleryType)) updates.galleryType = galleryType;
        if (typeof featuredImageUrl === "string") updates.featuredImageUrl = featuredImageUrl.trim();
        if (typeof featuredImagePublicId === "string") updates.featuredImagePublicId = featuredImagePublicId.trim();
        if (Array.isArray(items)) {
            const type = galleryType || (await FotosGallery.findById(req.params.id).lean())?.galleryType || "photos";
            updates.items = normalizeItems(items, type);
        }
        if (Number.isFinite(Number(displayOrder))) updates.displayOrder = Number(displayOrder);
        if (Object.prototype.hasOwnProperty.call(req.body, "isActive")) updates.isActive = Boolean(isActive);

        const updated = await FotosGallery.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
            lean: true,
        });
        if (!updated) return res.status(404).json({ success: false, error: "Gallery not found" });
        return res.json({ success: true, gallery: toPayload(updated) });
    } catch (err) {
        console.error("[fotos-galleries] PUT failed:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/fotos-galleries/:id
router.delete("/fotos-galleries/:id", authenticateToken, async (req, res) => {
    try {
        const deleted = await FotosGallery.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, error: "Gallery not found" });
        return res.json({ success: true });
    } catch (err) {
        console.error("[fotos-galleries] DELETE failed:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
