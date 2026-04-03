const express = require("express");
const mongoose = require("mongoose");
const UserInfo = require("../models/UserInfo");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ✅ Fetch all user infos from MongoDB
router.get("/get-userinfos", authenticateToken, async (req, res) => {
  try {
    const { programType, q } = req.query || {};

    const query = {};
    if (programType) {
      query["selectedOption.programType"] = programType;
    }

    // Optional search across common member fields (voornaam, id, plan, etc.)
    if (q && String(q).trim()) {
      const safe = escapeRegex(String(q).trim());
      const rx = new RegExp(safe, "i");
      query.$or = [
        { voornaam: rx },
        { achternaam: rx },
        { email: rx },
        { mollieCustomerId: rx },
        { molliePaymentId: rx },
        { "selectedOption.trainingTitle": rx },
        { "selectedOption.title": rx },
        { "selectedOption.programType": rx },
        { _id: mongoose.Types.ObjectId.isValid(String(q).trim()) ? new mongoose.Types.ObjectId(String(q).trim()) : null },
      ].filter(Boolean);
    }

    const allUserInfos = await UserInfo.find(query).sort({ createdAt: -1 }); // Fetch documents
    res.status(200).json(allUserInfos); // Return JSON response
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router; // Export the router