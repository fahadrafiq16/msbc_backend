const express = require("express");
const TrainingConfig = require("../models/TrainingConfig");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Seed data per program key. First GET creates this in MongoDB.
const DEFAULTS = {
  "personal-training": {
    paymentOptions: [
      {
        trainingTitle: "Personal Trainingen123",
        programType: "ptTraining",
        amount: "65.00",
        quantity: "1",
        title: "per uur | Training - 1 op 1",
        subTitle: "Je Personal Training abonnement bij My Summerbody Club",
        abonnementType: "Per uur",
        abonnementTitle: "Training 1 op 1",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: false,
      },
      {
        trainingTitle: "Personal Trainingen",
        programType: "ptTraining",
        amount: "499.00",
        quantity: "3",
        title: "p.m. | 3 maanden | Start Pakket | 2 x week trainen | incl.. vetmetingen | p.p.",
        subTitle: "Je Personal Training abonnement bij My Summerbody Club",
        abonnementType: "3 maanden | Start Pakket | Per maand",
        abonnementTitle: "2x week trainen | incl. vetmetingen",
        kosten: ["Pakket kosten: 3 x € 499,00", "Kosten per maand: € 499,00"],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 499,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Personal Trainingen",
        programType: "ptTraining",
        amount: "540.00",
        quantity: "3",
        title: "p.m. | 3 maanden | Start Pakket | 3 x week trainen | incl.. vetmetingen | p.p.",
        subTitle: "Je Personal Training abonnement bij My Summerbody Club",
        abonnementType: "3 maanden | Start Pakket | Per maand",
        abonnementTitle: "3 x week trainen | incl. vetmetingen",
        kosten: ["Pakket kosten: 3 x € 540,00", "Kosten per maand: € 540,00"],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 540,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Personal Trainingen",
        programType: "ptTraining",
        amount: "399.00",
        quantity: "6",
        title: "p.m. | 6 maanden | Start Pakket | 2 x week trainen | incl.. vetmetingen | p.p.",
        subTitle: "Je Personal Training abonnement bij My Summerbody Club",
        abonnementType: "6 maanden | Start Pakket | Per maand",
        abonnementTitle: "2 x week trainen | incl. vetmetingen",
        kosten: [" Pakket kosten: 6 x € 399,00 ", "Kosten per maand: € 399,00 "],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 399,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Personal Trainingen",
        programType: "ptTraining",
        amount: "300.00",
        quantity: "1",
        title: "| 5 Rittenkaart *| p.p.",
        subTitle: "Je Personal Training abonnement bij My Summerbody Club",
        abonnementType: "5 Rittenkaart",
        abonnementTitle: "Training 1 op 1",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: false,
      },
      {
        trainingTitle: "Personal Trainingen",
        programType: "ptTraining",
        amount: "550.00",
        quantity: "1",
        title: "| 10 Rittenkaart** | p.p.",
        subTitle: "Je Personal Training abonnement bij My Summerbody Club",
        abonnementType: "10 Rittenkaart",
        abonnementTitle: "Training 1 op 1",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: false,
      },
      {
        trainingTitle: "Personal Trainingen",
        programType: "ptTraining",
        amount: "1020.00",
        quantity: "1",
        title: "| 20 Rittenkaart *** | p.p.",
        subTitle: "Je Personal Training abonnement bij My Summerbody Club",
        abonnementType: "20 Rittenkaart",
        abonnementTitle: "Training 1 op 1",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: true,
        recurring: false,
      },
    ],
    extraOptions: [
      { amount: "300", title: "- per 3 maanden | Standaard | Vegan | 3 Metingen" },
    ],
    clubAmount: [{ amount: "150", title: "Clubpas/ QR-code", status: false }],
    trainingDescription: [
      {
        title: "Personal Training",
        quote:
          "Wij ziijn hier om je te inspirenen, En willen dat je beter bent dan gisteren: Omdat je niet hebt opgegeven.",
        trainingFeatures: [
          "Doel gerichte training op maat",
          "100% persoonlijke aandacht",
          "Tussentijdse voortgangsmetingen",
          "Voedingsschema op maat (Optioneel)",
        ],
        startingPrice: "€ 51,00",
        tenure: "Vanaf p.u.",
        cardHeadline: "My Summerbody",
        headLineBg: "#f04d17",
        trainingLink: "/trainingprograms/personal-training/payment-form",
      },
    ],
  },
};

const ALLOWED_KEYS = new Set(Object.keys(DEFAULTS));

function toPayload(doc) {
  return {
    paymentOptions: doc?.paymentOptions || [],
    extraOptions: doc?.extraOptions || [],
    clubAmount: doc?.clubAmount || [],
    trainingDescription: doc?.afvallenTrainingDescription || [],
  };
}

async function ensureConfig(key) {
  let config = await TrainingConfig.findOne({ key }).lean();
  if (!config) {
    const defaults = DEFAULTS[key] || {};
    const created = await TrainingConfig.create({
      key,
      paymentOptions: defaults.paymentOptions || [],
      extraOptions: defaults.extraOptions || [],
      clubAmount: defaults.clubAmount || [],
      afvallenTrainingDescription: defaults.trainingDescription || [],
    });
    config = created.toObject();
  }
  return config;
}

// GET /api/program-config/:key  (public — used by frontend forms/pages)
router.get("/program-config/:key", async (req, res) => {
  try {
    const key = String(req.params.key || "").trim().toLowerCase();
    if (!ALLOWED_KEYS.has(key)) {
      return res.status(404).json({ success: false, error: `Unknown program key: ${key}` });
    }
    const config = await ensureConfig(key);
    return res.json(toPayload(config));
  } catch (err) {
    console.error("[program-config] GET failed:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch program config" });
  }
});

// PUT /api/program-config/:key  (admin only)
router.put("/program-config/:key", authenticateToken, async (req, res) => {
  try {
    const key = String(req.params.key || "").trim().toLowerCase();
    if (!ALLOWED_KEYS.has(key)) {
      return res.status(404).json({ success: false, error: `Unknown program key: ${key}` });
    }

    const { paymentOptions, extraOptions, clubAmount, trainingDescription } = req.body || {};

    if (
      !Array.isArray(paymentOptions) ||
      !Array.isArray(extraOptions) ||
      !Array.isArray(clubAmount) ||
      !Array.isArray(trainingDescription)
    ) {
      return res.status(400).json({
        success: false,
        error: "Body must include arrays: paymentOptions, extraOptions, clubAmount, trainingDescription",
      });
    }

    const updated = await TrainingConfig.findOneAndUpdate(
      { key },
      {
        key,
        paymentOptions,
        extraOptions,
        clubAmount,
        afvallenTrainingDescription: trainingDescription,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true, lean: true }
    );

    return res.json({ success: true, ...toPayload(updated) });
  } catch (err) {
    console.error("[program-config] PUT failed:", err);
    return res.status(500).json({ success: false, error: "Failed to update program config" });
  }
});

module.exports = router;
