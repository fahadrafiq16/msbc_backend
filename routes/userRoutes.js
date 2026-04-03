const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const UserInfo = require("../models/UserInfo");

const router = express.Router();

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const getMailTransporter = () => {
  const user = process.env.SMTP_USER || "fahadrafiq16@gmail.com";
  const pass = process.env.SMTP_PASS || "mwjuoyfenyuwesli";
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
};

async function sendCredentialsEmail(email, voornaam, plainPassword) {
  try {
    const transporter = getMailTransporter();
    const dashboardUrl = String(process.env.BASE_FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "") + "/dashboard-new/login";
    await transporter.sendMail({
      from: process.env.SMTP_USER || "fahadrafiq16@gmail.com",
      to: email,
      subject: "Je MSBC Dashboard inloggegevens",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#ef4d16;margin-bottom:8px;">Welkom bij My Summerbody Club!</h2>
          <p>Beste ${voornaam || ""},</p>
          <p>Je account is aangemaakt. Hieronder vind je je inloggegevens voor je persoonlijke dashboard:</p>
          <table style="margin:16px 0;border-collapse:collapse;">
            <tr><td style="padding:6px 12px;font-weight:bold;">Gebruikersnaam</td><td style="padding:6px 12px;">${voornaam}</td></tr>
            <tr><td style="padding:6px 12px;font-weight:bold;">Wachtwoord</td><td style="padding:6px 12px;font-family:monospace;background:#f3f4f6;border-radius:6px;padding:6px 10px;">${plainPassword}</td></tr>
          </table>
          <p><a href="${dashboardUrl}" style="display:inline-block;background:#ef4d16;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Inloggen op Dashboard</a></p>
          <p style="font-size:13px;color:#6b7280;margin-top:16px;">Bewaar deze gegevens goed. Je kunt inloggen op:<br/><a href="${dashboardUrl}">${dashboardUrl}</a></p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[sendCredentialsEmail] Failed:", err.message);
  }
}

// Add user info to MongoDB
router.post("/add-user", async (req, res) => {
  try {
    const { molliePaymentId, ...rest } = req.body || {};

    if (!molliePaymentId || typeof molliePaymentId !== "string") {
      return res.status(400).json({
        success: false,
        message: "molliePaymentId is required to prevent duplicates",
      });
    }

    // Server-side safety: always ensure selectedOption.programType is present
    const selectedOption = rest?.selectedOption || {};
    const hasProgramType =
      selectedOption &&
      typeof selectedOption === "object" &&
      typeof selectedOption.programType === "string" &&
      selectedOption.programType.trim().length > 0;

    let inferredProgramType = null;
    if (!hasProgramType) {
      if (selectedOption?.recurring === true) {
        inferredProgramType = "club";
      } else if (String(selectedOption?.trainingTitle || "").toLowerCase().includes("personal")) {
        inferredProgramType = "ptTraining";
      }
    }

    const normalizedRest = {
      ...rest,
      ...(inferredProgramType
        ? { selectedOption: { ...selectedOption, programType: inferredProgramType } }
        : {}),
    };

    // Check if this payment already has a record (idempotent guard)
    const existing = await UserInfo.findOne({ molliePaymentId });
    const isNewRecord = !existing;

    // Generate password only for brand-new records
    let plainPassword = null;
    let passwordFields = {};
    if (isNewRecord) {
      plainPassword = generatePassword(12);
      const hash = await bcrypt.hash(plainPassword, 10);
      passwordFields = { memberPassword: hash };
    }

    const savedUser = await UserInfo.findOneAndUpdate(
      { molliePaymentId },
      { $set: { molliePaymentId, ...normalizedRest, ...passwordFields } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );

    // Email credentials only for new registrations
    if (isNewRecord && plainPassword && savedUser?.email) {
      sendCredentialsEmail(savedUser.email, savedUser.voornaam || "", plainPassword);
    }

    res.status(201).json({
      success: true,
      message: "User added successfully",
      data: savedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving user1", error: error.message });
  }
});

module.exports = router;



