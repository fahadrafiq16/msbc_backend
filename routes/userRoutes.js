const express = require("express");
const UserInfo = require("../models/UserInfo");

const router = express.Router();

// Add user info to MongoDB
router.post("/add-user", async (req, res) => {
  try {
    const { molliePaymentId, ...rest } = req.body || {};

    if (!molliePaymentId || typeof molliePaymentId !== "string") {
      return res.status(400).json({
        success: false,
        message: "molliePaymentId is required to prevent duplicates",
      });
    }

    // Server-side safety: always ensure selectedOption.programType is present
    const selectedOption = rest?.selectedOption || {};
    const hasProgramType =
      selectedOption &&
      typeof selectedOption === "object" &&
      typeof selectedOption.programType === "string" &&
      selectedOption.programType.trim().length > 0;

    let inferredProgramType = null;
    if (!hasProgramType) {
      if (selectedOption?.recurring === true) {
        inferredProgramType = "club";
      } else if (String(selectedOption?.trainingTitle || "").toLowerCase().includes("personal")) {
        inferredProgramType = "ptTraining";
      }
    }

    const normalizedRest = {
      ...rest,
      ...(inferredProgramType
        ? { selectedOption: { ...selectedOption, programType: inferredProgramType } }
        : {}),
    };

    // Idempotent write: if called twice (e.g. React StrictMode), we update the same record
    const savedUser = await UserInfo.findOneAndUpdate(
      { molliePaymentId },
      { $set: { molliePaymentId, ...normalizedRest } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: savedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving user1", error: error.message });
  }
});

module.exports = router;



