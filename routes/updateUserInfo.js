const express = require("express");
const UserInfo = require("../models/UserInfo");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.patch("/update-userinfo/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ["blocked", "manualPaymentStatus", "status"];
    const update = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    const updated = await UserInfo.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user", error: error.message });
  }
});

module.exports = router;
