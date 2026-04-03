const bcrypt = require("bcryptjs");
const AdminSettings = require("../models/AdminSettings");

const DEFAULTS = {
    username: "admin",
    password: "admin",
    email: "fahadrafiq16@gmail.com",
};

const MASTER_EMAIL = process.env.MASTER_ADMIN_EMAIL || DEFAULTS.email;

const ensureAdminSettings = async () => {
    let settings = await AdminSettings.findOne();
    if (!settings) {
        const passwordHash = await bcrypt.hash(DEFAULTS.password, 10);
        settings = await AdminSettings.create({
            username: DEFAULTS.username,
            passwordHash,
            passwordPlain: DEFAULTS.password,
            contactEmail: DEFAULTS.email,
        });
    }
    return settings;
};

const sanitizeSettings = (settings) => ({
    id: settings._id,
    username: settings.username,
    contactEmail: settings.contactEmail,
    updatedAt: settings.updatedAt,
    createdAt: settings.createdAt,
});

module.exports = {
    DEFAULTS,
    MASTER_EMAIL,
    ensureAdminSettings,
    sanitizeSettings,
};


