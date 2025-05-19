const mongoose = require("mongoose");

const userInfoSchema = new mongoose.Schema({
  email: { type: String, },
  paymentOption: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  totalAmount: { type: String, default: "" },
  clubAmount: { type: Number, default: ""},
  voornaam: { type: String, default: ""},
  tussenvoegsel: { type: String, default: "" },
  achternaam: { type: String, default: "" },
  
  dayOfMonth: { type: String, default: "" },
  month: { type: String, default: "" },
  years: { type: String, default: "" },
  postcode: { type: String, default: "" },
  huisnummer: { type: String, default: "" },
  toevoeging: { type: String, default: "" },
  adres: { type: String, default: "" },
  woonplaats: { type: String, default: "" },
  telefoonnummer: { type: String, default: "" },

  selectedOption: {
    trainingTitle: { type: String, default:"" },
    amount: { type: String, default:"" },
    quantity: { type: String, default:"" },
    title: { type: String, default:"" },
    subTitle: { type: String, default:"" },
    abonnementType: { type: String, default:"" },
    abonnementTitle: { type: String, default:"" },
    kosten: { type: [String], default:"" },
    totalKosten: { type: [String], default:"" },
    extra: { type: Boolean, default: false },
    recurring: { type: Boolean, default: false },
  },

  extraOption: {
    amount: { type: String, default:"" },
    title: { type: String, default:"" },
  },
  status: { type: String, default: "pending" }, // Example default value

}, { timestamps: true });

module.exports = mongoose.model("UserInfo", userInfoSchema);
