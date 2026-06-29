const mongoose = require("mongoose");

const trainingConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    paymentOptions: { type: Array, default: [] },
    extraOptions: { type: Array, default: [] },
    clubAmount: { type: Array, default: [] },
    afvallenTrainingDescription: { type: Array, default: [] },
    featuredImageUrl: { type: String, default: "" },
    featuredImagePublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingConfig", trainingConfigSchema);
