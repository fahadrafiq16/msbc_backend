const express = require("express");
const UserInfo = require("../models/UserInfo");

const router = express.Router();

// Add user info to MongoDB
router.post("/add-user", async (req, res) => {
  try {
    console.log(req.body);
    const userInfo = new UserInfo(req.body);
   
    const savedUser = await userInfo.save();
    res.status(201).json({ success: true, message: "User added successfully", data: savedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving user", error: error.message });
  }
});

module.exports = router;



