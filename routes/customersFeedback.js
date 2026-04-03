const express = require("express");
const CustomersFeedBack = require("../models/CustomersFeedBack");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

// Test route to verify the router is working
router.get("/test-feedback", (req, res) => {
    res.json({ success: true, message: "Feedback route is working!", timestamp: new Date().toISOString() });
});

// POST - Create a new customer feedback
router.post("/customers-feedback", async (req, res) => {
    try {
        const { name, position, rating, testimonial, isFeatured, displayOrder } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: "Name is required" });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: "Rating must be between 1 and 5" });
        }

        if (!testimonial || !testimonial.trim()) {
            return res.status(400).json({ success: false, error: "Testimonial is required" });
        }

        // Create customer feedback
        const ratingNum = parseInt(rating, 10);

        const newFeedback = await CustomersFeedBack.create({
            name: name.trim(),
            position: position ? position.trim() : "",
            isFeatured: Boolean(isFeatured),
            displayOrder: Number.isFinite(displayOrder) ? displayOrder : Number(displayOrder) || 0,
            rating: ratingNum,
            testimonial: testimonial.trim()
        });

        res.json({ 
            success: true, 
            feedback: newFeedback 
        });
    } catch (err) {
        console.error("Error creating customer feedback:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET - Fetch all customer feedbacks
router.get("/fetch-customers-feedback", async (req, res) => {
    try {
        const { featured, limit } = req.query;

        const query = {};
        if (featured === "true") {
            query.isFeatured = true;
        }

        const findQuery = CustomersFeedBack.find(query)
            .select('name position rating testimonial isFeatured displayOrder createdAt updatedAt')
            .sort(featured === "true" ? { displayOrder: 1, createdAt: -1 } : { createdAt: -1 })
            .lean();

        const limitNum = parseInt(limit, 10);
        if (Number.isInteger(limitNum) && limitNum > 0) {
            findQuery.limit(limitNum);
        }

        const feedbacks = await findQuery;

        // Filter out incomplete feedbacks
        const validFeedbacks = feedbacks.filter(feedback => {
            return feedback.name && 
                   feedback.rating !== undefined && 
                   feedback.rating !== null &&
                   feedback.testimonial;
        });

        res.json({ 
            success: true, 
            feedbacks: validFeedbacks 
        });
    } catch (err) {
        console.error("Error fetching customer feedbacks:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE - Remove a customer feedback by id
router.delete("/customers-feedback/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, error: "Feedback id is required" });
        }

        const deletedFeedback = await CustomersFeedBack.findByIdAndDelete(id);

        if (!deletedFeedback) {
            return res.status(404).json({ success: false, error: "Feedback not found" });
        }

        res.json({ success: true, feedback: deletedFeedback });
    } catch (err) {
        console.error("Error deleting customer feedback:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// PATCH - Update a customer feedback
router.patch("/customers-feedback/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        if (!id) {
            return res.status(400).json({ success: false, error: "Feedback id is required" });
        }

        const allowedFields = ["name", "position", "rating", "testimonial", "isFeatured", "displayOrder"];

        allowedFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        });

        if (typeof updates.name === "string") {
            if (!updates.name.trim()) {
                return res.status(400).json({ success: false, error: "Name cannot be empty" });
            }
            updates.name = updates.name.trim();
        }

        if (typeof updates.position === "string") {
            updates.position = updates.position.trim();
        }

        if (Object.prototype.hasOwnProperty.call(updates, "rating")) {
            const ratingNum = parseInt(updates.rating, 10);
            if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                return res.status(400).json({ success: false, error: "Rating must be an integer between 1 and 5" });
            }
            updates.rating = ratingNum;
        }

        if (typeof updates.testimonial === "string") {
            if (!updates.testimonial.trim()) {
                return res.status(400).json({ success: false, error: "Testimonial cannot be empty" });
            }
            updates.testimonial = updates.testimonial.trim();
        }

        if (Object.prototype.hasOwnProperty.call(updates, "isFeatured")) {
            updates.isFeatured = Boolean(updates.isFeatured);
        }

        if (Object.prototype.hasOwnProperty.call(updates, "displayOrder")) {
            const orderNum = Number(updates.displayOrder);
            updates.displayOrder = Number.isFinite(orderNum) && orderNum >= 0 ? orderNum : 0;
        }

        const updatedFeedback = await CustomersFeedBack.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true, lean: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({ success: false, error: "Feedback not found" });
        }

        res.json({ success: true, feedback: updatedFeedback });
    } catch (err) {
        console.error("Error updating customer feedback:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;

