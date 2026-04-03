const express = require("express");
const TrainingConfig = require("../models/TrainingConfig");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const AFVALLEN_KEY = "afvallen-training";

const defaultAfvallenConfig = {
  paymentOptions: [
    {
      trainingTitle: "Afvallen Trainingen",
      amount: "65.00",
      quantity: "1",
      title: "per uur | Training - 1 op 1",
      subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
      abonnementType: "Per uur",
      abonnementTitle: "Training 1 op 1",
      kosten: ["Kosten:"],
      totalKosten: ["Totaal Kosten"],
      extra: false,
      recurring: false,
    },
    {
      trainingTitle: "Afvallen Trainingen",
      amount: "499.00",
      quantity: "3",
      title: "p.m. | 3 maanden | Start Pakket | 2 x week trainen | incl.. vetmetingen | p.p.",
      subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
      abonnementType: "3 maanden | Start Pakket | Per maand",
      abonnementTitle: "2x week trainen | incl. vetmetingen",
      kosten: ["Pakket kosten: 3 x EUR 499,00", "Kosten per maand: EUR 499,00"],
      totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: EUR 499,00"],
      extra: true,
      recurring: true,
    },
    {
      trainingTitle: "Afvallen Trainingen",
      amount: "540.00",
      quantity: "3",
      title: "p.m. | 3 maanden | Start Pakket | 2 x week trainen | incl.. vetmetingen | p.p.",
      subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
      abonnementType: "3 maanden | Start Pakket | Per maand",
      abonnementTitle: "3 x week trainen | incl. vetmetingen",
      kosten: ["Pakket kosten: 3 x EUR 540,00", "Kosten per maand: EUR 540,00"],
      totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: EUR 540,00"],
      extra: true,
      recurring: true,
    },
    {
      trainingTitle: "Afvallen Trainingen",
      amount: "399.00",
      quantity: "3",
      title: "p.m. | 6 maanden | Start Pakket | 2 x week trainen | incl.. vetmetingen | p.p.",
      subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
      abonnementType: "6 maanden | Start Pakket | Per maand",
      abonnementTitle: "2 x week trainen | incl. vetmetingen",
      kosten: ["Pakket kosten: 6 x EUR 399,00", "Kosten per maand: EUR 399,00"],
      totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: EUR 399,00"],
      extra: true,
      recurring: true,
    },
    {
      trainingTitle: "Afvallen Trainingen",
      amount: "300.00",
      quantity: "1",
      title: "| 5 Rittenkaart *| p.p.",
      subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
      abonnementType: "10 Rittenkaart",
      abonnementTitle: "Training 1 op 1",
      kosten: ["Kosten:"],
      totalKosten: ["Totaal Kosten"],
      extra: false,
      recurring: false,
    },
    {
      trainingTitle: "Afvallen Trainingen",
      amount: "550.00",
      quantity: "1",
      title: "| 10 Rittenkaart** | p.p.",
      subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
      abonnementType: "10 Rittenkaart",
      abonnementTitle: "Training 1 op 1",
      kosten: ["Kosten:"],
      totalKosten: ["Totaal Kosten"],
      extra: false,
      recurring: false,
    },
    {
      trainingTitle: "Afvallen Trainingen",
      amount: "1020.00",
      quantity: "1",
      title: "| 20 Rittenkaart *** | p.p.",
      subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
      abonnementType: "20 Rittenkaart",
      abonnementTitle: "Training 1 op 1",
      kosten: ["Kosten:"],
      totalKosten: ["Totaal Kosten"],
      extra: true,
      recurring: false,
    },
  ],
  extraOptions: [{ amount: "300", title: "- per 3 maanden | Standaard | Vegan | 3 Metingen" }],
  clubAmount: [{ amount: "15", title: "Clubpas/ QR-code", status: false }],
  afvallenTrainingDescription: [
    {
      title: "Afvallen Training",
      quote:
        "Wij ziijn hier om je te inspirenen, En willen dat je beter bent dan gisteren: Omdat je niet hebt opgegeven.",
      trainingFeatures: [
        "Afvallen is begeleiding op maat ",
        "Afgestemd op je fysieke gesteldheid",
        "Vermindering van rugklachten",
        "Voedingsbegeleiding (Optioneel)",
      ],
      startingPrice: "EUR 51,00",
      tenure: "Vanaf p.u.",
      cardHeadline: "Its Your Time To Shine",
      headLineBg: "#2b388e",
      featuredImage: "PersonalImage",
      trainingLink: "/trainingprograms/afvallen-training/payment-form",
    },
  ],
};

async function ensureAfvallenConfig() {
  let config = await TrainingConfig.findOne({ key: AFVALLEN_KEY }).lean();
  if (!config) {
    config = await TrainingConfig.create({ key: AFVALLEN_KEY, ...defaultAfvallenConfig });
    return config.toObject();
  }
  return config;
}

function toPayload(config) {
  return {
    paymentOptions: config.paymentOptions || [],
    extraOptions: config.extraOptions || [],
    clubAmount: config.clubAmount || [],
    afvallenTrainingDescription: config.afvallenTrainingDescription || [],
  };
}

router.get("/training-config/afvallen", async (_req, res) => {
  try {
    const config = await ensureAfvallenConfig();
    return res.json(toPayload(config));
  } catch (err) {
    console.error("Failed to fetch Afvallen config:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch training config" });
  }
});

router.put("/training-config/afvallen", authenticateToken, async (req, res) => {
  try {
    const { paymentOptions, extraOptions, clubAmount, afvallenTrainingDescription } = req.body || {};

    if (!Array.isArray(paymentOptions) || !Array.isArray(extraOptions) || !Array.isArray(clubAmount) || !Array.isArray(afvallenTrainingDescription)) {
      return res.status(400).json({
        success: false,
        error:
          "Body must include arrays: paymentOptions, extraOptions, clubAmount, afvallenTrainingDescription",
      });
    }

    const updated = await TrainingConfig.findOneAndUpdate(
      { key: AFVALLEN_KEY },
      { key: AFVALLEN_KEY, paymentOptions, extraOptions, clubAmount, afvallenTrainingDescription },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true, lean: true }
    );

    return res.json(toPayload(updated));
  } catch (err) {
    console.error("Failed to update Afvallen config:", err);
    return res.status(500).json({ success: false, error: "Failed to update training config" });
  }
});

module.exports = router;
