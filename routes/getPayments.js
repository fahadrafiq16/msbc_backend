const express = require("express");
const UserInfo = require("../models/UserInfo");

const router = express.Router();



// ✅ Fetch all user infos from MongoDB
router.get("/get-userinfos", async (req, res) => {
    try {
      const allUserInfos = await UserInfo.find(); // Fetch all documents
      res.status(200).json(allUserInfos); // Return JSON response
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  });
  
  module.exports = router; // Export the router