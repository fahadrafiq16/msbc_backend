const express = require("express");
const mongoose = require("mongoose");
const FoodPlan = require("../models/FoodPlan");
const UserInfo = require("../models/UserInfo");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const WEEK_OPTIONS = [4, 6, 12, 24, 36];

function defaultSchemaFields() {
  return [
    { id: "doel", kind: "field", label: "Doel", value: "", labelEditable: false, inputType: "text" },
    { id: "lengte", kind: "field", label: "Lengte", value: "", labelEditable: false, inputType: "text" },
    { id: "start-gewicht", kind: "field", label: "Start gewicht", value: "", labelEditable: false, inputType: "text" },
    { id: "eind-gewicht", kind: "field", label: "Eind gewicht", value: "", labelEditable: false, inputType: "text" },
    { id: "leeftijd", kind: "field", label: "Leeftijd", value: "", labelEditable: false, inputType: "text" },
    { id: "training", kind: "field", label: "Training", value: "", labelEditable: false, inputType: "text" },
    { id: "aandachtspunt", kind: "field", label: "Aandachtspunt", value: "", labelEditable: false, inputType: "text" },
    { id: "richtlijn-calorieen", kind: "field", label: "Richtlijn calorieën", value: "", labelEditable: false, inputType: "text" },
    { id: "start", kind: "field", label: "Start", value: "", labelEditable: false, inputType: "text" },
    { id: "opbouw", kind: "field", label: "Opbouw", value: "", labelEditable: false, inputType: "text" },
    { id: "afbouw", kind: "field", label: "Afbouw", value: "", labelEditable: false, inputType: "text" },
    { id: "eiwitten", kind: "field", label: "Eiwitten", value: "", labelEditable: false, inputType: "text" },
  ];
}

function defaultAdviceFields() {
  return [
    { id: "voedingsadvies-voor", kind: "field", label: "Voedingsadvies voor", value: "", labelEditable: false, inputType: "text" },
    { id: "focus-op", kind: "field", label: "Focus op", value: "", labelEditable: false, inputType: "textarea" },
    { id: "shake", kind: "field", label: "Shake", value: "", labelEditable: false, inputType: "textarea" },
    { id: "kcal", kind: "field", label: "kcal", value: "", labelEditable: false, inputType: "text" },
  ];
}

function defaultMealPlan() {
  return { weekPlan: 12, meals: [] };
}

function defaultDailyGuidelines() {
  return [
    {
      id: "drink",
      title: "Drink",
      content: "2,5–3 liter water\nEventueel:\nmelk\nsmoothies\nmass shakes",
    },
    {
      id: "supplementen",
      title: "Supplementen",
      content: "Whey Protein\nCreatine Monohydraat 5g\nper dag\nOmega 3\nMultivitamine",
    },
    {
      id: "gezonde-vetten",
      title: "Gezonde vetten",
      content: "Avocado\nNoten\nPindakaas\nOlijfolie",
    },
  ];
}

function defaultGainProducts() {
  return [
    {
      id: "koolhydraten",
      title: "Koolhydraten",
      content: "Rijst\nHavermout\nPasta\nWraps\nAardappelen\nGranola",
    },
    {
      id: "eiwitten",
      title: "Eiwitten",
      content: "Kip\nZalm\nEieren\nBiefstuk\nTonijn\nKwark\nWhey",
    },
    {
      id: "gezonde-vetten",
      title: "Gezonde vetten",
      content: "Avocado\nNoten\nPindakaas\nOlijfolie",
    },
    {
      id: "tip",
      title: "Tip!",
      content: "",
    },
  ];
}

const WEEK_DAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];

function emptyPlan(memberId) {
  return {
    memberId,
    fields: defaultSchemaFields(),
    adviceFields: defaultAdviceFields(),
    mealPlan: defaultMealPlan(),
    dailyGuidelines: defaultDailyGuidelines(),
    gainProducts: defaultGainProducts(),
    selectedWeekDay: "zo",
  };
}

function normalizeFields(fields) {
  if (!Array.isArray(fields)) return [];
  return fields
    .map((f, idx) => ({
      id: String(f?.id || `field-${idx}-${Date.now()}`),
      kind: f?.kind === "heading" ? "heading" : "field",
      label: String(f?.label ?? "").trim(),
      value: String(f?.value ?? ""),
      labelEditable: Boolean(f?.labelEditable),
      inputType: f?.inputType === "textarea" ? "textarea" : "text",
    }))
    .filter((f) => f.id);
}

function upgradeSchemaFields(fields) {
  if (!Array.isArray(fields) || fields.length === 0) return defaultSchemaFields();
  const ids = new Set(fields.map((f) => f.id));
  const alreadyNew =
    ids.has("start-gewicht") || ids.has("eind-gewicht") || ids.has("opbouw") || ids.has("afbouw") || ids.has("aandachtspunt");
  if (alreadyNew) return fields;

  const OLD_IDS = new Set(["doel", "lengte", "gewicht", "leeftijd", "training", "richtlijn-calorieen", "start", "eiwitten"]);
  const byId = Object.fromEntries(fields.map((f) => [f.id, f]));
  const customs = fields.filter((f) => !OLD_IDS.has(f.id));

  return [
    ...defaultSchemaFields().map((f) => {
      if (f.id === "start-gewicht") {
        return { ...f, value: String(byId["gewicht"]?.value || "") };
      }
      return { ...f, value: String(byId[f.id]?.value || "") };
    }),
    ...customs,
  ];
}

function normalizeMealPlan(mealPlan) {
  const src = mealPlan && typeof mealPlan === "object" ? mealPlan : {};
  const week = Number(src.weekPlan);
  const weekPlan = WEEK_OPTIONS.includes(week) ? week : 12;

  const meals = Array.isArray(src.meals)
    ? src.meals
        .map((m, idx) => ({
          id: String(m?.id || `meal-${idx}-${Date.now()}`),
          menuType: String(m?.menuType ?? ""),
          time: String(m?.time ?? ""),
          title: String(m?.title ?? ""),
          checkedIn: Boolean(m?.checkedIn),
          menuItems: Array.isArray(m?.menuItems)
            ? m.menuItems
                .map((item, i) => ({
                  id: String(item?.id || `item-${idx}-${i}-${Date.now()}`),
                  value: String(item?.value ?? ""),
                }))
                .filter((item) => item.id)
            : [],
        }))
        .filter((m) => m.id)
    : [];

  return { weekPlan, meals };
}

function normalizeDailyGuidelines(list) {
  if (!Array.isArray(list)) return defaultDailyGuidelines();
  if (list.length === 0) return [];
  return list
    .map((b, idx) => ({
      id: String(b?.id || `guideline-${idx}-${Date.now()}`),
      title: String(b?.title ?? ""),
      content: String(b?.content ?? ""),
    }))
    .filter((b) => b.id);
}

function normalizeGainProducts(list) {
  if (!Array.isArray(list)) return defaultGainProducts();
  if (list.length === 0) return [];
  return list
    .map((b, idx) => ({
      id: String(b?.id || `product-${idx}-${Date.now()}`),
      title: String(b?.title ?? ""),
      content: String(b?.content ?? ""),
    }))
    .filter((b) => b.id);
}

function normalizeWeekDay(day) {
  const d = String(day || "").trim().toLowerCase();
  return WEEK_DAYS.includes(d) ? d : "zo";
}

/** Migrate older plans that stored fixed keys + customRules */
function migrateLegacyPlan(plan) {
  let fields;
  if (Array.isArray(plan.fields) && plan.fields.length > 0) {
    fields = upgradeSchemaFields(normalizeFields(plan.fields));
  } else {
    fields = defaultSchemaFields().map((f) => ({
      ...f,
      value: String(plan?.[f.id] ?? ""),
    }));
    const customs = Array.isArray(plan.customRules) ? plan.customRules : [];
    customs.forEach((r, idx) => {
      fields.push({
        id: String(r?.id || `rule-${idx}`),
        kind: "field",
        label: String(r?.label ?? "").trim(),
        value: String(r?.value ?? ""),
        labelEditable: true,
        inputType: "text",
      });
    });
  }

  const adviceFields =
    Array.isArray(plan.adviceFields) && plan.adviceFields.length > 0
      ? normalizeFields(plan.adviceFields)
      : defaultAdviceFields();

  const mealPlan = plan.mealPlan ? normalizeMealPlan(plan.mealPlan) : defaultMealPlan();

  const dailyGuidelines = Array.isArray(plan.dailyGuidelines)
    ? plan.dailyGuidelines.length > 0
      ? normalizeDailyGuidelines(plan.dailyGuidelines)
      : []
    : defaultDailyGuidelines();

  const gainProducts = Array.isArray(plan.gainProducts)
    ? plan.gainProducts.length > 0
      ? normalizeGainProducts(plan.gainProducts)
      : []
    : defaultGainProducts();

  const selectedWeekDay = normalizeWeekDay(plan.selectedWeekDay);

  return { ...plan, fields, adviceFields, mealPlan, dailyGuidelines, gainProducts, selectedWeekDay };
}

// GET /api/food-plans/:memberId
router.get("/food-plans/:memberId", authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, error: "Invalid member id" });
    }

    const member = await UserInfo.findById(memberId).select("_id").lean();
    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    let plan = await FoodPlan.findOne({ memberId }).lean();
    if (!plan) {
      plan = emptyPlan(memberId);
    } else {
      plan = migrateLegacyPlan(plan);
    }

    return res.json({ success: true, plan });
  } catch (err) {
    console.error("[food-plans] GET failed:", err);
    return res.status(500).json({ success: false, error: "Failed to load food plan" });
  }
});

// PUT /api/food-plans/:memberId — partial upsert (only provided sections)
router.put("/food-plans/:memberId", authenticateToken, async (req, res) => {
  try {
    const { memberId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, error: "Invalid member id" });
    }

    const member = await UserInfo.findById(memberId).select("_id").lean();
    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    const body = req.body || {};
    const update = {};
    if (body.fields !== undefined) update.fields = normalizeFields(body.fields);
    if (body.adviceFields !== undefined) update.adviceFields = normalizeFields(body.adviceFields);
    if (body.mealPlan !== undefined) update.mealPlan = normalizeMealPlan(body.mealPlan);
    if (body.dailyGuidelines !== undefined) {
      update.dailyGuidelines = normalizeDailyGuidelines(body.dailyGuidelines);
    }
    if (body.gainProducts !== undefined) {
      update.gainProducts = normalizeGainProducts(body.gainProducts);
    }
    if (body.selectedWeekDay !== undefined) {
      update.selectedWeekDay = normalizeWeekDay(body.selectedWeekDay);
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    const plan = await FoodPlan.findOneAndUpdate(
      { memberId },
      { $set: update, $setOnInsert: { memberId } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return res.json({ success: true, plan: migrateLegacyPlan(plan) });
  } catch (err) {
    console.error("[food-plans] PUT failed:", err);
    return res.status(500).json({ success: false, error: "Failed to save food plan" });
  }
});

// GET /api/member-portal/food-plan — logged-in member's own plan (read-only)
router.get("/member-portal/food-plan", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "member") {
      return res.status(403).json({ success: false, error: "Member access only" });
    }

    const memberId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ success: false, error: "Invalid member id" });
    }

    const member = await UserInfo.findById(memberId).select("_id voornaam achternaam").lean();
    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    let plan = await FoodPlan.findOne({ memberId }).lean();
    if (!plan) {
      return res.json({
        success: true,
        exists: false,
        plan: null,
        member: { id: String(member._id), voornaam: member.voornaam, achternaam: member.achternaam },
      });
    }

    return res.json({
      success: true,
      exists: true,
      plan: migrateLegacyPlan(plan),
      member: { id: String(member._id), voornaam: member.voornaam, achternaam: member.achternaam },
    });
  } catch (err) {
    console.error("[member-portal/food-plan] GET failed:", err);
    return res.status(500).json({ success: false, error: "Failed to load food plan" });
  }
});

// PATCH /api/member-portal/food-plan/meals/:mealId/check-in — member toggles meal check-in
router.patch("/member-portal/food-plan/meals/:mealId/check-in", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "member") {
      return res.status(403).json({ success: false, error: "Member access only" });
    }

    const memberId = req.user.id;
    const { mealId } = req.params;
    const checkedIn = Boolean(req.body?.checkedIn);

    const plan = await FoodPlan.findOne({ memberId });
    if (!plan) {
      return res.status(404).json({ success: false, error: "Food plan not found" });
    }

    const meals = Array.isArray(plan.mealPlan?.meals) ? plan.mealPlan.meals : [];
    const meal = meals.find((m) => String(m.id) === String(mealId));
    if (!meal) {
      return res.status(404).json({ success: false, error: "Meal not found" });
    }

    meal.checkedIn = checkedIn;
    plan.markModified("mealPlan");
    await plan.save();

    return res.json({ success: true, mealId, checkedIn });
  } catch (err) {
    console.error("[member-portal/food-plan] check-in failed:", err);
    return res.status(500).json({ success: false, error: "Failed to update check-in" });
  }
});

module.exports = router;
