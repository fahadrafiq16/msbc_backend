const express = require("express");
const UserInfo = require("../models/UserInfo");

const router = express.Router();


// ✅ Fetch a specific user info by ID
router.get("/get-userinfo/:id", async (req, res) => {
    try {
      const userInfo = await UserInfo.findById(req.params.id); // Fetch user info by _id
      if (!userInfo) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(userInfo);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  });
  
  module.exports = router; // Export the router