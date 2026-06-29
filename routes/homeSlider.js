const express = require("express");
const HomeSlide = require("../models/HomeSlide");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test-home-slides", (_req, res) => {
    res.json({ success: true, message: "Home slides route is working!", timestamp: new Date().toISOString() });
});

router.post("/home-slides", authenticateToken, async (req, res) => {
    try {
        const { text1, text2, imageUrl, imagePublicId, displayOrder, isActive } = req.body;

        if (!text1 || !String(text1).trim()) {
            return res.status(400).json({ success: false, error: "text1 is required" });
        }
        if (!text2 || !String(text2).trim()) {
            return res.status(400).json({ success: false, error: "text2 is required" });
        }

        const orderNum = Number(displayOrder);
        const slide = await HomeSlide.create({
            text1: String(text1).trim(),
            text2: String(text2).trim(),
            imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : "",
            imagePublicId: typeof imagePublicId === "string" ? imagePublicId.trim() : "",
            displayOrder: Number.isFinite(orderNum) && orderNum >= 0 ? orderNum : 0,
            isActive: isActive !== false,
        });

        res.json({ success: true, slide });
    } catch (err) {
        console.error("Error creating home slide:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get("/fetch-home-slides", async (req, res) => {
    try {
        const { active, limit } = req.query;
        const query = {};

        if (active === "true") {
            query.isActive = true;
        }

        const findQuery = HomeSlide.find(query)
            .select("text1 text2 imageUrl imagePublicId displayOrder isActive createdAt updatedAt")
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean();

        const limitNum = parseInt(limit, 10);
        if (Number.isInteger(limitNum) && limitNum > 0) {
            findQuery.limit(limitNum);
        }

        const slides = await findQuery;
        const validSlides = slides.filter((slide) => slide.text1 && slide.text2);

        res.json({ success: true, slides: validSlides });
    } catch (err) {
        console.error("Error fetching home slides:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.patch("/home-slides/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, error: "Slide id is required" });
        }

        const updates = {};
        const allowedFields = ["text1", "text2", "imageUrl", "imagePublicId", "displayOrder", "isActive"];

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        });

        if (typeof updates.text1 === "string") {
            if (!updates.text1.trim()) {
                return res.status(400).json({ success: false, error: "text1 cannot be empty" });
            }
            updates.text1 = updates.text1.trim();
        }

        if (typeof updates.text2 === "string") {
            if (!updates.text2.trim()) {
                return res.status(400).json({ success: false, error: "text2 cannot be empty" });
            }
            updates.text2 = updates.text2.trim();
        }

        if (typeof updates.imageUrl === "string") {
            updates.imageUrl = updates.imageUrl.trim();
        }

        if (typeof updates.imagePublicId === "string") {
            updates.imagePublicId = updates.imagePublicId.trim();
        }

        if (Object.prototype.hasOwnProperty.call(updates, "displayOrder")) {
            const orderNum = Number(updates.displayOrder);
            updates.displayOrder = Number.isFinite(orderNum) && orderNum >= 0 ? orderNum : 0;
        }

        if (Object.prototype.hasOwnProperty.call(updates, "isActive")) {
            updates.isActive = Boolean(updates.isActive);
        }

        const slide = await HomeSlide.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
            lean: true,
        });

        if (!slide) {
            return res.status(404).json({ success: false, error: "Slide not found" });
        }

        res.json({ success: true, slide });
    } catch (err) {
        console.error("Error updating home slide:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete("/home-slides/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, error: "Slide id is required" });
        }

        const deleted = await HomeSlide.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: "Slide not found" });
        }

        res.json({ success: true, slide: deleted });
    } catch (err) {
        console.error("Error deleting home slide:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
