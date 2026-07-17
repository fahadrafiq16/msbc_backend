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

  "groep-pt": {
    paymentOptions: [
      {
        trainingTitle: "Groep PT Trainingen",
        programType: "ptTraining",
        amount: "45.00",
        quantity: "1",
        title: "| per uur | 1 Op 2 training | p.p",
        subTitle: "Je Groep PT Training abonnement bij My Summerbody Club",
        abonnementType: "Per uur",
        abonnementTitle: "Training | 1 op 2 | Prijs p.p.",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: false,
      },
      {
        trainingTitle: "Groep PT Trainingen",
        programType: "ptTraining",
        amount: "200.00",
        quantity: "3",
        title: "p.m. | 1 Op 2 training | 3 maanden | Start Pakket | 2 x week trainen | p.p.",
        subTitle: "Je Groep PT Training abonnement bij My Summerbody Club",
        abonnementType: "3 maanden | Start Pakket | Per maand",
        abonnementTitle: "2 x week trainen | 1 op 2 | Prijs p.p.",
        kosten: ["Pakket kosten: 3 x € 200,00", "Kosten per maand: € 200,00"],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 200,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Groep PT Trainingen",
        programType: "ptTraining",
        amount: "175.00",
        quantity: "3",
        title: "p.m. | 1 Op 3 training | 3 maanden | Start Pakket | 2 x week trainen | p.p.",
        subTitle: "Je Groep PT Training abonnement bij My Summerbody Club",
        abonnementType: "3 maanden | Start Pakket | Per maand",
        abonnementTitle: "2 x week trainen | 1 op 3 | Prijs p.p.",
        kosten: ["Pakket kosten: 3 x € 175,00", "Kosten per maand: € 175,00"],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 175,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Groep PT Trainingen",
        programType: "ptTraining",
        amount: "250.00",
        quantity: "3",
        title: "p.m. | 1 Op 2 training | 3 maanden | Start Pakket | 3 x week trainen | p.p.",
        subTitle: "Je Groep PT Training abonnement bij My Summerbody Club",
        abonnementType: "3 maanden | Start Pakket | Per maand",
        abonnementTitle: "3 x week trainen | 1 op 2 | Prijs p.p.",
        kosten: [" Pakket kosten: 3 x € 250,00 ", "Kosten per maand: € 250,00 "],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 250,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Groep PT Trainingen",
        programType: "ptTraining",
        amount: "280.00",
        quantity: "1",
        title: "p.m. | 1 Op 2 training | per maand | 2x week trainen | p.p.",
        subTitle: "Je Groep PT Training abonnement bij My Summerbody Club",
        abonnementType: "Maandelijks | Per maand",
        abonnementTitle: "2 x week trainen | 1 op 2 | Prijs p.p.",
        kosten: ["Kosten per maand: € 280,00"],
        totalKosten: ["Maandelijkse kosten: € 280,00"],
        extra: false,
        recurring: false,
      },
      {
        trainingTitle: "Groep PT Trainingen",
        programType: "ptTraining",
        amount: "180.00",
        quantity: "1",
        title: "| 1 Op 2 training | 5 Rittenkaart * | p.p.",
        subTitle: "Je Groep PT Training abonnement bij My Summerbody Club",
        abonnementType: "5 Rittenkaart",
        abonnementTitle: "Training 1 op 2",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: false,
      },
      {
        trainingTitle: "Groep PT Trainingen",
        programType: "ptTraining",
        amount: "350.00",
        quantity: "1",
        title: "| 1 Op 2 training | 10 Rittenkaart * | p.p.",
        subTitle: "Je Groep PT Training abonnement bij My Summerbody Club",
        abonnementType: "10 Rittenkaart",
        abonnementTitle: "Training 1 op 2",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: true,
        recurring: false,
      },
    ],
    extraOptions: [
      { amount: "300", title: "per 3 maanden | Standaard | Vegan | 3 Metingen | p.p." },
      { amount: "500", title: "per 3 maanden | Standaard | Vegan | 3 Metingen | Duo" },
    ],
    clubAmount: [{ amount: "0", title: "Clubpas/ QR-code", status: false }],
    trainingDescription: [
      {
        title: "Groep PT Training",
        quote:
          "Wij ziijn hier om je te inspirenen, En willen dat je beter bent dan gisteren: Omdat je niet hebt opgegeven.",
        trainingFeatures: [
          "Doel gerichte training op maat",
          "100% persoonlijke aandacht",
          "Tussentijdse voortgangsmetingen",
          "Voedingsschema op maat (Optioneel)",
        ],
        startingPrice: "€ 95,00",
        tenure: "Per uur",
        cardHeadline: "My BFF",
        headLineBg: "#d602dd",
        trainingLink: "/trainingprograms/groeppt-training/payment-form",
      },
    ],
  },

  "wedstrijd-training": {
    paymentOptions: [
      {
        trainingTitle: "Wedstrijd Trainingen",
        amount: "80.00",
        quantity: "1",
        title: "| per 1.5 uur | Training – 1 op 1",
        subTitle: "Je Wedstrijd Training abonnement bij My Summerbody Club",
        abonnementType: "Per uur",
        abonnementTitle: "Training & Coaching | 1,00/1,5 uur",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: false,
      },
      {
        trainingTitle: "Wedstrijd Trainingen",
        amount: "945.00",
        quantity: "3",
        title: "| 3 maanden | Start Pakket | 3 x week trainen | incl.. vetmetingen",
        subTitle: "Je Wedstrijd Training abonnement bij My Summerbody Club",
        abonnementType: "3 maanden | Start Pakket | Per maand",
        abonnementTitle: "Training & Coaching | 1,5 uur | 3 x week trainen | incl. vetmetingen",
        kosten: ["Pakket kosten: 3x € 945,00", "Kosten per maand: € 945,00"],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 945,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Wedstrijd Trainingen",
        amount: "1170.00",
        quantity: "6",
        title: "p.m. | 6 maanden | Start Pakket | 4 x week trainen | incl.. vetmetingen",
        subTitle: "Je Wedstrijd Training abonnement bij My Summerbody Club",
        abonnementType: "6 maanden | Start Pakket | Per maand",
        abonnementTitle: "Training & Coaching | 1,5 uur | 4 x week trainen | incl. vetmetingen",
        kosten: ["Pakket kosten: 6x € 1.170,00", "Kosten per maand: € 1.170,00"],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 1170,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Wedstrijd Trainingen",
        amount: "800.00",
        quantity: "1",
        title: "| 10 Rittenkaart* | 1.5 uur | v.a. p.p.",
        subTitle: "Je Wedstrijd Training abonnement bij My Summerbody Club",
        abonnementType: "10 Rittenkaart",
        abonnementTitle: "Training & Coaching | 1,00/1,5 uur",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: false,
      },
      {
        trainingTitle: "Wedstrijd Trainingen",
        amount: "1500.00",
        quantity: "1",
        title: "| 20 Rittenkaart** | 1.5 uur | v.a. p.p.",
        subTitle: "Je Wedstrijd Training abonnement bij My Summerbody Club",
        abonnementType: "20 Rittenkaart",
        abonnementTitle: "Training & Coaching | 1,00 / 1,5 uur",
        kosten: ["Kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: true,
        recurring: false,
      },
    ],
    extraOptions: [
      { amount: "300", title: "- per 3 maanden | Standaard | Vegan | 3 Metingen" },
    ],
    clubAmount: [{ amount: "15", title: "Clubpas/ QR-code", status: true }],
    trainingDescription: [
      {
        title: "Wedstrijd Training",
        quote:
          "Wij ziijn hier om je te inspirenen, En willen dat je beter bent dan gisteren: Omdat je niet hebt opgegeven.",
        trainingFeatures: [
          "Wedstrijd is begeleiding op maat ",
          "Afgestemd op je fysieke gesteldheid",
          "Vermindering van rugklachten",
          "Voedingsbegeleiding (Optioneel)",
        ],
        startingPrice: "€ 51,00",
        tenure: "Vanaf p.u.",
        cardHeadline: "Its Your Time To Shine",
        headLineBg: "#ff0004",
        trainingLink: "/trainingprograms/wedstrijd-training/payment-form",
      },
    ],
  },

  "afvallen-training": {
    paymentOptions: [
      {
        trainingTitle: "Afvallen Trainingen",
        programType: "ptTraining",
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
        programType: "ptTraining",
        amount: "499.00",
        quantity: "3",
        title: "p.m. | 3 maanden | Start Pakket | 2 x week trainen | incl.. vetmetingen | p.p.",
        subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
        abonnementType: "3 maanden | Start Pakket | Per maand",
        abonnementTitle: "2x week trainen | incl. vetmetingen",
        kosten: ["Pakket kosten: 3 x € 499,00", "Kosten per maand: € 499,00"],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 499,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Afvallen Trainingen",
        programType: "ptTraining",
        amount: "540.00",
        quantity: "3",
        title: "p.m. | 3 maanden | Start Pakket | 2 x week trainen | incl.. vetmetingen | p.p.",
        subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
        abonnementType: "3 maanden | Start Pakket | Per maand",
        abonnementTitle: "3 x week trainen | incl. vetmetingen",
        kosten: ["Pakket kosten: 3 x € 540,00", "Kosten per maand: € 540,00"],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 540,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Afvallen Trainingen",
        programType: "ptTraining",
        amount: "399.00",
        quantity: "3",
        title: "p.m. | 6 maanden | Start Pakket | 2 x week trainen | incl.. vetmetingen | p.p.",
        subTitle: "Je Afvallen Training abonnement bij My Summerbody Club",
        abonnementType: "6 maanden | Start Pakket | Per maand",
        abonnementTitle: "2 x week trainen | incl. vetmetingen",
        kosten: [" Pakket kosten: 6 x € 399,00 ", "Kosten per maand: € 399,00 "],
        totalKosten: ["Kosten 1e maand", "Daarna maandelijkse kosten: € 399,00"],
        extra: true,
        recurring: true,
      },
      {
        trainingTitle: "Afvallen Trainingen",
        programType: "ptTraining",
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
        programType: "ptTraining",
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
        programType: "ptTraining",
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
    extraOptions: [
      { amount: "300", title: "- per 3 maanden | Standaard | Vegan | 3 Metingen" },
    ],
    clubAmount: [{ amount: "15", title: "Clubpas/ QR-code", status: false }],
    trainingDescription: [
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
        startingPrice: "€ 51,00",
        tenure: "Vanaf p.u.",
        cardHeadline: "Its Your Time To Shine",
        headLineBg: "#2b388e",
        trainingLink: "/trainingprograms/afvallen-training/payment-form",
      },
    ],
  },

  "summerbody-1jarig": {
    paymentOptions: [
      {
        trainingTitle: "1-jarig My Summerbody Club",
        amount: "45.00",
        quantity: "13",
        title: "Betalen per 4 weken",
        subTitle: "Je 1-jarig Summerbody abonnement bij My Summerbody Club",
        abonnementType: "per 4 weken",
        abonnementTitle: "Actie: 3 maanden gratis trainen",
        kosten: ["kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: true,
        programType: "club",
        clubExtraTitle: "Betaling per 4 weken voor 1 jaar via automatishe incasso",
      },
    ],
    extraOptions: [{}],
    clubAmount: [{ amount: "0", title: "Clubpas/ QR-code", status: false }],
    trainingDescription: [
      {
        title: "Summerbody 1 jarig",
        quote:
          "Wij ziijn hier om je te inspirenen, En willen dat je beter bent dan gisteren: Omdat je niet hebt opgegeven.",
        trainingFeatures: [
          "Geen inschrijfgeld (t.w.v. €29,99)",
          "Na 12 maanden maandelijks opzegbaar",
          "14 dagen bedenktijd",
          "Leden selectie",
        ],
        startingPrice: "€ 45,00",
        tenure: "Per 4 weken",
        cardHeadline: "Meest Gekozen",
        headLineBg: "#000000",
        trainingLink: "/trainingprograms/my-summerbody-1-jaar/payment-form",
      },
    ],
  },

  "summerbody-6-maanden": {
    paymentOptions: [
      {
        trainingTitle: "Summerbody 6 maanden",
        amount: "65.00",
        quantity: "6",
        title: "Betalen per 4 weken",
        subTitle: "Je 6 maanden Summerbody abonnement bij My Summerbody Club",
        abonnementType: "per 4 weken",
        abonnementTitle: "Actie: 3 maanden gratis trainen",
        kosten: ["kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: true,
        programType: "club",
        clubExtraTitle: "Betaling per 4 weken voor 6 maanden via automatishe incasso",
      },
    ],
    extraOptions: [{}],
    clubAmount: [{ amount: "0", title: "Clubpas/ QR-code", status: false }],
    trainingDescription: [
      {
        title: "Summerbody 6 maanden",
        quote:
          "Wij ziijn hier om je te inspirenen, En willen dat je beter bent dan gisteren: 'Omdat je niet hebt opgegeven'.",
        trainingFeatures: [
          "Geen inschrijfgeld (t.w.v. €29,99)",
          "Na 12 maanden maandelijks opzegbaar",
          "14 dagen bedenktijd",
          "Leden selectie",
        ],
        startingPrice: "€ 75,00",
        tenure: "Per 4 weken",
        cardHeadline: "Populaire",
        headLineBg: "#49edd7",
        trainingLink: "/trainingprograms/my-summerbody-6-maanden/payment-form",
      },
    ],
  },

  "summerbody-flex": {
    paymentOptions: [
      {
        trainingTitle: "Summerbody Flex",
        amount: "75.00",
        quantity: "3",
        title: "Betalen per 4 weken",
        subTitle: "Je maandelijks opzegbaar My Summerbody Flexy abonnement bij My Summerbody Club",
        abonnementType: "per 4 weken",
        abonnementTitle: "Actie: Geen",
        kosten: ["kosten:"],
        totalKosten: ["Totaal Kosten"],
        extra: false,
        recurring: true,
        programType: "club",
        clubExtraTitle: "Betaling per 4 weken via automatishe incasso",
      },
    ],
    extraOptions: [{}],
    clubAmount: [{ amount: "15", title: "Clubpas/ QR-code", status: true }],
    trainingDescription: [
      {
        title: "Summerbody Flex",
        quote:
          "Wij ziijn hier om je te inspirenen, En willen dat je beter bent dan gisteren: 'Omdat je niet hebt opgegeven'.",
        trainingFeatures: [
          "Geen inschrijfgeld (t.w.v. €29,99)",
          "Na 12 maanden maandelijks opzegbaar",
          "14 dagen bedenktijd",
          "Leden selectie",
        ],
        startingPrice: "€ 75,00",
        tenure: "Per 4 weken",
        cardHeadline: "Zorgeloos",
        headLineBg: "#7406e2",
        trainingLink: "/trainingprograms/my-summerbody-flex/payment-form",
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
    featuredImageUrl: doc?.featuredImageUrl || "",
    featuredImagePublicId: doc?.featuredImagePublicId || "",
    introImage1Url: doc?.introImage1Url || "",
    introImage1PublicId: doc?.introImage1PublicId || "",
    introImage2Url: doc?.introImage2Url || "",
    introImage2PublicId: doc?.introImage2PublicId || "",
    introVideoUrl: doc?.introVideoUrl || "",
    introVideoPublicId: doc?.introVideoPublicId || "",
    introQuote: doc?.introQuote || "",
    introDescription: doc?.introDescription || "",
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

    const { paymentOptions, extraOptions, clubAmount, trainingDescription, featuredImageUrl, featuredImagePublicId, introImage1Url, introImage1PublicId, introImage2Url, introImage2PublicId, introVideoUrl, introVideoPublicId, introQuote, introDescription } = req.body || {};

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

    const update = {
      key,
      paymentOptions,
      extraOptions,
      clubAmount,
      afvallenTrainingDescription: trainingDescription,
    };

    if (typeof featuredImageUrl === "string") {
      update.featuredImageUrl = featuredImageUrl.trim();
    }

    if (typeof featuredImagePublicId === "string") {
      update.featuredImagePublicId = featuredImagePublicId.trim();
    }

    if (typeof introImage1Url === "string") {
      update.introImage1Url = introImage1Url.trim();
    }

    if (typeof introImage1PublicId === "string") {
      update.introImage1PublicId = introImage1PublicId.trim();
    }

    if (typeof introImage2Url === "string") {
      update.introImage2Url = introImage2Url.trim();
    }

    if (typeof introImage2PublicId === "string") {
      update.introImage2PublicId = introImage2PublicId.trim();
    }

    if (typeof introVideoUrl === "string") {
      update.introVideoUrl = introVideoUrl.trim();
    }

    if (typeof introVideoPublicId === "string") {
      update.introVideoPublicId = introVideoPublicId.trim();
    }

    if (typeof introQuote === "string") {
      update.introQuote = introQuote.trim();
    }

    if (typeof introDescription === "string") {
      update.introDescription = introDescription.trim();
    }

    const updated = await TrainingConfig.findOneAndUpdate(
      { key },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true, lean: true }
    );

    return res.json({ success: true, ...toPayload(updated) });
  } catch (err) {
    console.error("[program-config] PUT failed:", err);
    return res.status(500).json({ success: false, error: "Failed to update program config" });
  }
});

module.exports = router;
