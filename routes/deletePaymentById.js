const express = require("express");
const UserInfo = require("../models/UserInfo");

const router = express.Router();


// DELETE API - Delete a user by ID
router.delete("/delete-userinfo/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await UserInfo.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  });
  
  module.exports = router; // Export the router