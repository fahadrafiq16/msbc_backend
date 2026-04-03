const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const authenticateToken = require("../middleware/authMiddleware");
const { ensureAdminSettings, sanitizeSettings, MASTER_EMAIL } = require("../utils/adminSettings");

const router = express.Router();

const ensureJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
};

const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

    if (SMTP_HOST && SMTP_PORT) {
        return nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT),
            secure: SMTP_SECURE === "true",
            auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        });
    }

    const fallbackUser = process.env.SMTP_USER || "fahadrafiq16@gmail.com";
    const fallbackPass = process.env.SMTP_PASS || "mwjuoyfenyuwesli";

    if (!fallbackUser || !fallbackPass) {
        console.warn("SMTP configuration missing. Emails will not be sent.");
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: fallbackUser,
            pass: fallbackPass,
        },
    });
};

router.post("/login", async (req, res) => {
    try {
        ensureJwtSecret();
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: "Username and password are required" });
        }

        // --- Try admin login first ---
        const settings = await ensureAdminSettings();

        if (settings.username === username.trim()) {
            const isMatch = await bcrypt.compare(password, settings.passwordHash);
            if (isMatch) {
                const token = jwt.sign(
                    { id: settings._id, username: settings.username, role: "admin" },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRY || "12h" }
                );
                return res.json({ success: true, token, user: { ...sanitizeSettings(settings), role: "admin" } });
            }
        }

        // --- Try member login (voornaam = username) ---
        const UserInfo = require("../models/UserInfo");
        const member = await UserInfo.findOne({ voornaam: username.trim() }).sort({ createdAt: -1 });

        if (member && member.memberPassword) {
            const memberMatch = await bcrypt.compare(password, member.memberPassword);
            if (memberMatch) {
                const token = jwt.sign(
                    { id: String(member._id), voornaam: member.voornaam, email: member.email, role: "member" },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRY || "12h" }
                );
                return res.json({
                    success: true,
                    token,
                    user: {
                        role: "member",
                        memberId: String(member._id),
                        voornaam: member.voornaam,
                        email: member.email,
                    },
                });
            }
        }

        return res.status(401).json({ success: false, error: "Invalid credentials" });
    } catch (err) {
        console.error("Login failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get("/admin-settings", authenticateToken, async (req, res) => {
    try {
        const settings = await ensureAdminSettings();
        res.json({ success: true, settings: sanitizeSettings(settings) });
    } catch (err) {
        console.error("Fetching admin settings failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put("/admin-settings", authenticateToken, async (req, res) => {
    try {
        ensureJwtSecret();
        const { username, password, contactEmail } = req.body;
        const settings = await ensureAdminSettings();

        if (typeof username === "string") {
            if (!username.trim()) {
                return res.status(400).json({ success: false, error: "Username cannot be empty" });
            }
            settings.username = username.trim();
        }

        if (typeof contactEmail === "string") {
            if (!contactEmail.trim()) {
                return res.status(400).json({ success: false, error: "Email cannot be empty" });
            }
            settings.contactEmail = contactEmail.trim();
        }

        if (typeof password === "string" && password.trim()) {
            settings.passwordHash = await bcrypt.hash(password, 10);
            settings.passwordPlain = password;
        }

        await settings.save();

        res.json({
            success: true,
            settings: sanitizeSettings(settings),
        });
    } catch (err) {
        console.error("Updating admin settings failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/forward-logins", authenticateToken, async (req, res) => {
    try {
        const settings = await ensureAdminSettings();
        const transporter = createTransporter();

        if (!transporter) {
            console.warn("Email transporter not configured. Skipping email send.");
            return res.status(200).json({
                success: true,
                message: "Email transporter not configured. Credentials not sent.",
            });
        }

        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"MSBC Admin" <${process.env.SMTP_USER || "no-reply@msbc.local"}>`,
            to: settings.contactEmail,
            subject: "MSBC Dashboard login details",
            text: `Hier zijn je huidige dashboard inloggegevens:\n\nGebruikersnaam: ${settings.username}\nWachtwoord: ${settings.passwordPlain}\n\nJe kunt deze gegevens wijzigen via het dashboard.`,
        });

        res.json({ success: true, message: "Login credentials forwarded via email." });
    } catch (err) {
        console.error("Forwarding logins failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/forgot-logins", async (req, res) => {
    try {
        const { email } = req.body || {};
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, error: "Email is required" });
        }

        const settings = await ensureAdminSettings();
        const normalizedInput = email.trim().toLowerCase();
        const allowedEmails = [
            settings.contactEmail?.toLowerCase(),
            MASTER_EMAIL?.toLowerCase(),
        ].filter(Boolean);

        if (!allowedEmails.includes(normalizedInput)) {
            // Avoid revealing whether the email exists
            return res.json({
                success: true,
                message: "If the email exists, the login details will be sent shortly.",
            });
        }

        const transporter = createTransporter();

        if (!transporter) {
            console.warn("Email transporter not configured. Skipping email send.");
            return res.status(200).json({
                success: true,
                message: "Email transporter not configured. Credentials not sent.",
            });
        }

        const recipients = Array.from(
            new Set([settings.contactEmail, MASTER_EMAIL].filter(Boolean))
        );

        await transporter.sendMail({
            from: process.env.SMTP_FROM || `"MSBC Admin" <${process.env.SMTP_USER || "no-reply@msbc.local"}>`,
            to: recipients.join(","),
            subject: "MSBC Dashboard login details",
            text: `Hier zijn je huidige dashboard inloggegevens:\n\nGebruikersnaam: ${settings.username}\nWachtwoord: ${settings.passwordPlain}\n\nJe kunt deze gegevens wijzigen via het dashboard.`,
        });

        res.json({
            success: true,
            message: "Login credentials forwarded via email.",
        });
    } catch (err) {
        console.error("Forgot logins failed:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;


