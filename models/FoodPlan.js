const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["field", "heading"], default: "field" },
    label: { type: String, default: "", trim: true },
    value: { type: String, default: "", trim: true },
    labelEditable: { type: Boolean, default: false },
    inputType: { type: String, enum: ["text", "textarea"], default: "text" },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    value: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const mealBlockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    menuType: { type: String, default: "", trim: true },
    time: { type: String, default: "", trim: true },
    title: { type: String, default: "", trim: true },
    // Set by client check-in later; admin UI shows red/green
    checkedIn: { type: Boolean, default: false },
    menuItems: { type: [menuItemSchema], default: [] },
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    weekPlan: { type: Number, enum: [4, 6, 12, 24, 36], default: 12 },
    meals: { type: [mealBlockSchema], default: [] },
  },
  { _id: false }
);

const guidelineBlockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, default: "", trim: true },
    content: { type: String, default: "" },
  },
  { _id: false }
);

const foodPlanSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserInfo",
      required: true,
      unique: true,
      index: true,
    },
    // Voedingsschema informatie
    fields: { type: [fieldSchema], default: [] },
    // Voedingsadvies (second box)
    adviceFields: { type: [fieldSchema], default: [] },
    // Meal plan (Maaltijd blocks)
    mealPlan: { type: mealPlanSchema, default: () => ({ weekPlan: 12, meals: [] }) },
    // Dagelijkse Richtlijnen
    dailyGuidelines: { type: [guidelineBlockSchema], default: [] },
    // Producten die helpen bij aankomen
    gainProducts: { type: [guidelineBlockSchema], default: [] },
    // Week day selector under fifth section (Ma–Zo) — dynamic later
    selectedWeekDay: { type: String, default: "zo", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoodPlan", foodPlanSchema);
