const express = require("express");
const HomeSection = require("../models/HomeSection");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const LIFESTYLE_SECTION_KEY = "lifestyle-video";
const POPUP_VIDEO_SECTION_KEY = "popup-video-area";
const GALLERY_SECTION_KEY = "gallery";
const FOOTER_SECTION_KEY = "footer";
const BOOTCAMP_PAGE_SECTION_KEY = "bootcamp-page";
const PT_RENT_PAGE_SECTION_KEY = "pt-rent-page";
const CLUB_SUBSCRIPTIONS_SECTION_KEY = "club-subscriptions";
const OVER_MSBC_SECTION_KEY = "over-msbc";
const ABONNEMENT_PAGE_SECTION_KEY = "abonnement-page";
const INFORMATIE_PAGE_SECTION_KEY = "informatie-page";
const PROEFLES_PAGE_SECTION_KEY = "proefles-page";
const WEBSITE_HOME_ORDER_SECTION_KEY = "website-home-order";
const DEFAULT_INFORMATIE_TITLE = "Ik wil graag meer informatie over:";
const DEFAULT_INFORMATIE_BODY =
    "Je ontvangt de informatie over de door jouw aangevraagde training zo snel mogelijk! Vul eerst nog even je gegevens in.";
const DEFAULT_INFORMATIE_GEGEVENS_HEADING = "Mijn gegevens";
const DEFAULT_INFORMATIE_PERSONAL_HEADING = "Persoonlijke gegevens";
const DEFAULT_INFORMATIE_CONTACT_HEADING = "Contactgegevens";
const DEFAULT_INFORMATIE_TRAINING_OPTIONS = [
    { title: "Small Group Training", url: "small-group-training", displayOrder: 0 },
    { title: "Personal Training", url: "personal-training", displayOrder: 1 },
    { title: "Duo PT", url: "duo-pt", displayOrder: 2 },
    { title: "Wedstrijd Training", url: "wedstrijd-training", displayOrder: 3 },
    { title: "Afvallen", url: "afvallen", displayOrder: 4 },
];
const DEFAULT_PROEFLES_TITLE = "Ik wil een afspraak maken voor proefles:";
const DEFAULT_PROEFLES_DAY_TIME_HEADING = "Kies dag & tijd";
const DEFAULT_PROEFLES_DAY_LABEL = "Proefles dag";
const DEFAULT_PROEFLES_TIME_LABEL = "Verzoektijd";
const DEFAULT_PROEFLES_GEGEVENS_HEADING = "Mijn gegevens";
const DEFAULT_PROEFLES_INTRO =
    "Je ontvang de informatie over de door jouw aangevraade trainen zo snel mogelijk!";
const DEFAULT_PROEFLES_PERSONAL_HEADING = "Persoonlijke gegevens";
const DEFAULT_PROEFLES_CONTACT_HEADING = "Contactgegevens";
const DEFAULT_PROEFLES_BODY = JSON.stringify({
    noticeText: "Let op! Je krijgt een bevestiging of de door jouw gekozen tijdstip vrij is voor een proefles.",
    confirmText: "Je bevestiging ontvang je op dit e-mailadres",
});
const DEFAULT_PROEFLES_TRAINING_OPTIONS = [
    { title: "Small Group Training (Gratis)", url: "small-group-training", displayOrder: 0 },
    { title: "Personal Training (Betaald) *", url: "personal-training", displayOrder: 1 },
    { title: "Duo PT (Betaald) *", url: "duo-pt", displayOrder: 2 },
    { title: "Wedstrijd Training (Betaald) *", url: "wedstrijd-training", displayOrder: 3 },
    { title: "Afvallen (Betaald) *", url: "afvallen", displayOrder: 4 },
];
const DEFAULT_PROEFLES_DAY_OPTIONS = [
    { title: "Ma", url: "ma", displayOrder: 0 },
    { title: "Di", url: "di", displayOrder: 1 },
    { title: "Wo", url: "wo", displayOrder: 2 },
    { title: "Do", url: "do", displayOrder: 3 },
    { title: "Vr", url: "vr", displayOrder: 4 },
    { title: "Za", url: "za", displayOrder: 5 },
];
const DEFAULT_PROEFLES_TIME_OPTIONS = [
    { imageUrl: "07:30-08:30", imagePublicId: "", linkUrl: "07-30-08-30", displayOrder: 0 },
    { imageUrl: "08:30-09:30", imagePublicId: "", linkUrl: "08-30-09-30", displayOrder: 1 },
    { imageUrl: "09:30-10:30", imagePublicId: "", linkUrl: "09-30-10-30", displayOrder: 2 },
    { imageUrl: "10:30-11:30", imagePublicId: "", linkUrl: "10-30-11-30", displayOrder: 3 },
    { imageUrl: "16:00-17:00", imagePublicId: "", linkUrl: "16-00-17-00", displayOrder: 4 },
    { imageUrl: "18:00-19:00", imagePublicId: "", linkUrl: "18-00-19-00", displayOrder: 5 },
];
const DEFAULT_ABONNEMENT_TITLE = "Maak Je Lichaam Sterker, Blijf *Fit* en *Gezond*";
const DEFAULT_ABONNEMENT_BODY =
    "We bieden een breed scala aan diensten aan om je fitnesservaring effectiever, flexibeler en creatiever te maken. Onze gekwalificeerde trainers zijn niet alleen goed uitgerust met kennis over fitness, gewichtsverlies, wedstrijdtrainingen en kickboksen, maar hebben zelf op hoog niveau deelgenomen aan wedstrijden in hun vakgebied. Door onze kennis kunnen wij trainingsprogramma’s aanbieden die allemaal zijn afgestemd op het doel en de wensen van de klant. Hieronder staan enkele diensten die wij aanbieden.";
const DEFAULT_ABONNEMENT_BUTTON_LABEL = "Start Je Training Vandaag!";
const DEFAULT_ABONNEMENT_BUTTON_URL = "/proefles";
const DEFAULT_ABONNEMENT_IMAGE =
    "https://mysummerbodyclub.nl/wp-content/themes/my-summer-body-club/assets/Sterk_Fit_Gezond_-MSBC.jpg";
const DEFAULT_YOUTUBE_EMBED = "https://www.youtube.com/embed/3A8X8O4dT5E";
const DEFAULT_LIFESTYLE_EMBED = DEFAULT_YOUTUBE_EMBED;
const DEFAULT_GALLERY_BUTTON_URL = "https://mysummerbodyclub.nl/fotos/";
const DEFAULT_GALLERY_ITEMS = [
    { imageUrl: "", imagePublicId: "", linkUrl: "https://mysummerbodyclub.nl/trainingfotos/meeting-the-best-2/", displayOrder: 0 },
    { imageUrl: "", imagePublicId: "", linkUrl: "https://mysummerbodyclub.nl/trainingfotos/naomy-burnet-sap-cup-2108/", displayOrder: 1 },
    { imageUrl: "", imagePublicId: "", linkUrl: "https://mysummerbodyclub.nl/trainingfotos/gabrielle-golds-gym-classic-2018/", displayOrder: 2 },
    { imageUrl: "", imagePublicId: "", linkUrl: "https://mysummerbodyclub.nl/trainingfotos/de-nieuwe-lichting/", displayOrder: 3 },
    { imageUrl: "", imagePublicId: "", linkUrl: "https://mysummerbodyclub.nl/trainingfotos/de-nieuwe-lichting/", displayOrder: 4 },
];

const DEFAULT_FOOTER_COLUMN1_LINKS = [
    { title: "Kies Afvallen", url: "/trainingprograms/afvallen-training/", displayOrder: 0 },
    { title: "Kies Groep PT", url: "/trainingprograms/groeppt-training/", displayOrder: 1 },
    { title: "Kies Personal Training", url: "/trainingprograms/personal-training/", displayOrder: 2 },
    { title: "Kies Wedstrijd Training", url: "/trainingprograms/wedstrijd-training/", displayOrder: 3 },
];

const DEFAULT_FOOTER_COLUMN4_LINKS = [
    { title: "Algemene voorwaarden", url: "/algemene-voorwaarden/", displayOrder: 0 },
    { title: "Privacyverklaring", url: "/privacyverklaring/", displayOrder: 1 },
    { title: "Huisregels", url: "/", displayOrder: 2 },
    { title: "Cookies", url: "/", displayOrder: 3 },
    { title: "Herroepings-Recht", url: "/", displayOrder: 4 },
    { title: "SEPA", url: "/", displayOrder: 5 },
];

const DEFAULT_SOCIAL_LINKS = [
    { platform: "facebook", url: "https://www.facebook.com/mysummerbodyclub/" },
    { platform: "instagram", url: "https://www.instagram.com/mysummerbodyclub/" },
    { platform: "pinterest", url: "https://pinterest.com/mysummerbodyclub/" },
    { platform: "youtube", url: "https://www.youtube.com/@mysummerbodyclub" },
];

function normalizeFooterLinks(items) {
    if (!Array.isArray(items)) return [];
    return items
        .map((item, index) => ({
            title: typeof item?.title === "string" ? item.title.trim() : "",
            url: typeof item?.url === "string" ? item.url.trim() : "",
            displayOrder: Number.isFinite(Number(item?.displayOrder)) ? Number(item.displayOrder) : index,
        }))
        .filter((item) => item.title && item.url)
        .sort((a, b) => a.displayOrder - b.displayOrder);
}

function normalizeSocialLinks(items) {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => ({
            platform: typeof item?.platform === "string" ? item.platform.trim().toLowerCase() : "",
            url: typeof item?.url === "string" ? item.url.trim() : "",
        }))
        .filter((item) => item.platform && item.url);
}

function normalizeFacebookPageUrl(input) {
    if (!input || typeof input !== "string") return "";
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http")) return trimmed;
    if (trimmed.includes("facebook.com")) return `https://${trimmed.replace(/^\/+/, "")}`;
    return `https://www.facebook.com/${trimmed.replace(/^\/+/, "")}`;
}

function normalizeGalleryItems(items) {
    if (!Array.isArray(items)) return [];
    return items
        .map((item, index) => ({
            imageUrl: typeof item?.imageUrl === "string" ? item.imageUrl.trim() : "",
            imagePublicId: typeof item?.imagePublicId === "string" ? item.imagePublicId.trim() : "",
            linkUrl: typeof item?.linkUrl === "string" ? item.linkUrl.trim() : "",
            displayOrder: Number.isFinite(Number(item?.displayOrder)) ? Number(item.displayOrder) : index,
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
}

function toYoutubeEmbedUrl(input) {
    if (!input || typeof input !== "string") return "";
    const trimmed = input.trim();
    if (!trimmed) return "";

    if (trimmed.includes("/embed/")) {
        return trimmed.split("?")[0];
    }

    const shortMatch = trimmed.match(/youtu\.be\/([^?&/]+)/);
    if (shortMatch) {
        return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    const watchMatch = trimmed.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
        return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return `https://www.youtube.com/embed/${trimmed}`;
    }

    return trimmed;
}

router.get("/fetch-home-section/:sectionKey", async (req, res) => {
    try {
        const { sectionKey } = req.params;
        if (!sectionKey) {
            return res.status(400).json({ success: false, error: "sectionKey is required" });
        }

        let section = await HomeSection.findOne({ sectionKey }).lean();

        if (!section && sectionKey === LIFESTYLE_SECTION_KEY) {
            section = {
                sectionKey: LIFESTYLE_SECTION_KEY,
                title: "Begin Een Nieuwe Life Style",
                youtubeEmbedUrl: DEFAULT_LIFESTYLE_EMBED,
                bannerImageUrl: "",
                bannerImagePublicId: "",
                isActive: true,
            };
        }

        if (!section && sectionKey === POPUP_VIDEO_SECTION_KEY) {
            section = {
                sectionKey: POPUP_VIDEO_SECTION_KEY,
                title: "Popup Video Area",
                youtubeEmbedUrl: DEFAULT_YOUTUBE_EMBED,
                leftImageUrl: "",
                leftImagePublicId: "",
                rightImageUrl: "",
                rightImagePublicId: "",
                isActive: true,
            };
        }

        if (!section && sectionKey === GALLERY_SECTION_KEY) {
            section = {
                sectionKey: GALLERY_SECTION_KEY,
                title: "Gallery",
                photosButtonUrl: DEFAULT_GALLERY_BUTTON_URL,
                videosButtonUrl: DEFAULT_GALLERY_BUTTON_URL,
                galleryItems: DEFAULT_GALLERY_ITEMS,
                isActive: true,
            };
        }

        if (!section && sectionKey === FOOTER_SECTION_KEY) {
            section = {
                sectionKey: FOOTER_SECTION_KEY,
                title: "Footer",
                footerColumn1Title: "Onze Trainingen",
                footerColumn1Links: DEFAULT_FOOTER_COLUMN1_LINKS,
                footerColumn4Title: "Info & Service",
                footerColumn4Links: DEFAULT_FOOTER_COLUMN4_LINKS,
                footerLogoImageUrl: "",
                footerLogoImagePublicId: "",
                footerLegalText: "Algemene voorwaarden | Privacybeleid | KVK 59250097 | Btw: NL003699102B10",
                facebookPageUrl: "https://www.facebook.com/mysummerbodyclub",
                socialLinks: DEFAULT_SOCIAL_LINKS,
                isActive: true,
            };
        }

        if (!section && sectionKey === BOOTCAMP_PAGE_SECTION_KEY) {
            section = {
                sectionKey: BOOTCAMP_PAGE_SECTION_KEY,
                title: "Bootcamp",
                bannerImageUrl: "",
                bannerImagePublicId: "",
                isActive: true,
            };
        }

        if (!section && sectionKey === PT_RENT_PAGE_SECTION_KEY) {
            section = {
                sectionKey: PT_RENT_PAGE_SECTION_KEY,
                title: "PT Ruimte Huren",
                bannerImageUrl: "",
                bannerImagePublicId: "",
                isActive: true,
            };
        }

        if (!section && sectionKey === CLUB_SUBSCRIPTIONS_SECTION_KEY) {
            section = {
                sectionKey: CLUB_SUBSCRIPTIONS_SECTION_KEY,
                title: "Club Abonnementen",
                isActive: true,
            };
        }

        if (!section && sectionKey === INFORMATIE_PAGE_SECTION_KEY) {
            section = {
                sectionKey: INFORMATIE_PAGE_SECTION_KEY,
                title: DEFAULT_INFORMATIE_TITLE,
                bodyText: DEFAULT_INFORMATIE_BODY,
                buttonLabel: DEFAULT_INFORMATIE_GEGEVENS_HEADING,
                footerColumn1Title: DEFAULT_INFORMATIE_PERSONAL_HEADING,
                footerColumn4Title: DEFAULT_INFORMATIE_CONTACT_HEADING,
                footerColumn1Links: DEFAULT_INFORMATIE_TRAINING_OPTIONS,
                isActive: true,
            };
        }

        if (!section && sectionKey === PROEFLES_PAGE_SECTION_KEY) {
            section = {
                sectionKey: PROEFLES_PAGE_SECTION_KEY,
                title: DEFAULT_PROEFLES_TITLE,
                bodyText: DEFAULT_PROEFLES_BODY,
                buttonLabel: DEFAULT_PROEFLES_DAY_TIME_HEADING,
                photosButtonUrl: DEFAULT_PROEFLES_DAY_LABEL,
                videosButtonUrl: DEFAULT_PROEFLES_TIME_LABEL,
                footerColumn1Title: DEFAULT_PROEFLES_GEGEVENS_HEADING,
                footerLegalText: DEFAULT_PROEFLES_INTRO,
                footerColumn4Title: DEFAULT_PROEFLES_PERSONAL_HEADING,
                buttonUrl: DEFAULT_PROEFLES_CONTACT_HEADING,
                footerColumn1Links: DEFAULT_PROEFLES_TRAINING_OPTIONS,
                footerColumn4Links: DEFAULT_PROEFLES_DAY_OPTIONS,
                galleryItems: DEFAULT_PROEFLES_TIME_OPTIONS,
                isActive: true,
            };
        }

        if (!section && sectionKey === WEBSITE_HOME_ORDER_SECTION_KEY) {
            section = {
                sectionKey: WEBSITE_HOME_ORDER_SECTION_KEY,
                title: "Website Home Section Order",
                bodyText: "",
                isActive: true,
            };
        }

        if (!section && sectionKey === OVER_MSBC_SECTION_KEY) {
            section = {
                sectionKey: OVER_MSBC_SECTION_KEY,
                title: "Over MSBC",
                galleryItems: [],
                isActive: true,
            };
        }

        if (!section && sectionKey === ABONNEMENT_PAGE_SECTION_KEY) {
            section = {
                sectionKey: ABONNEMENT_PAGE_SECTION_KEY,
                title: DEFAULT_ABONNEMENT_TITLE,
                bodyText: DEFAULT_ABONNEMENT_BODY,
                buttonLabel: DEFAULT_ABONNEMENT_BUTTON_LABEL,
                buttonUrl: DEFAULT_ABONNEMENT_BUTTON_URL,
                bannerImageUrl: DEFAULT_ABONNEMENT_IMAGE,
                bannerImagePublicId: "",
                isActive: true,
            };
        }

        if (!section) {
            return res.status(404).json({ success: false, error: "Section not found" });
        }

        res.json({ success: true, section });
    } catch (err) {
        console.error("Error fetching home section:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.put("/home-sections/:sectionKey", authenticateToken, async (req, res) => {
    try {
        const { sectionKey } = req.params;
        const { title, bodyText, buttonLabel, buttonUrl, youtubeEmbedUrl, bannerImageUrl, bannerImagePublicId, leftImageUrl, leftImagePublicId, rightImageUrl, rightImagePublicId, photosButtonUrl, videosButtonUrl, galleryItems, footerColumn1Title, footerColumn1Links, footerColumn4Title, footerColumn4Links, footerLogoImageUrl, footerLogoImagePublicId, footerLegalText, facebookPageUrl, socialLinks, isActive } = req.body;

        if (!sectionKey) {
            return res.status(400).json({ success: false, error: "sectionKey is required" });
        }

        const updates = { sectionKey };

        if (typeof title === "string") {
            updates.title = title.trim();
        }

        if (typeof bodyText === "string") {
            updates.bodyText = bodyText.trim();
        }

        if (typeof buttonLabel === "string") {
            updates.buttonLabel = buttonLabel.trim();
        }

        if (typeof buttonUrl === "string") {
            updates.buttonUrl = buttonUrl.trim();
        }

        if (typeof youtubeEmbedUrl === "string") {
            const normalized = toYoutubeEmbedUrl(youtubeEmbedUrl);
            if (!normalized) {
                return res.status(400).json({ success: false, error: "YouTube URL is required" });
            }
            updates.youtubeEmbedUrl = normalized;
        }

        if (typeof bannerImageUrl === "string") {
            updates.bannerImageUrl = bannerImageUrl.trim();
        }

        if (typeof bannerImagePublicId === "string") {
            updates.bannerImagePublicId = bannerImagePublicId.trim();
        }

        if (typeof leftImageUrl === "string") {
            updates.leftImageUrl = leftImageUrl.trim();
        }

        if (typeof leftImagePublicId === "string") {
            updates.leftImagePublicId = leftImagePublicId.trim();
        }

        if (typeof rightImageUrl === "string") {
            updates.rightImageUrl = rightImageUrl.trim();
        }

        if (typeof rightImagePublicId === "string") {
            updates.rightImagePublicId = rightImagePublicId.trim();
        }

        if (typeof photosButtonUrl === "string") {
            updates.photosButtonUrl = photosButtonUrl.trim();
        }

        if (typeof videosButtonUrl === "string") {
            updates.videosButtonUrl = videosButtonUrl.trim();
        }

        if (Array.isArray(galleryItems)) {
            updates.galleryItems = normalizeGalleryItems(galleryItems);
        }

        if (typeof footerColumn1Title === "string") {
            updates.footerColumn1Title = footerColumn1Title.trim();
        }

        if (Array.isArray(footerColumn1Links)) {
            updates.footerColumn1Links = normalizeFooterLinks(footerColumn1Links);
        }

        if (typeof footerColumn4Title === "string") {
            updates.footerColumn4Title = footerColumn4Title.trim();
        }

        if (Array.isArray(footerColumn4Links)) {
            updates.footerColumn4Links = normalizeFooterLinks(footerColumn4Links);
        }

        if (typeof footerLogoImageUrl === "string") {
            updates.footerLogoImageUrl = footerLogoImageUrl.trim();
        }

        if (typeof footerLogoImagePublicId === "string") {
            updates.footerLogoImagePublicId = footerLogoImagePublicId.trim();
        }

        if (typeof footerLegalText === "string") {
            updates.footerLegalText = footerLegalText.trim();
        }

        if (typeof facebookPageUrl === "string") {
            updates.facebookPageUrl = normalizeFacebookPageUrl(facebookPageUrl);
        }

        if (Array.isArray(socialLinks)) {
            updates.socialLinks = normalizeSocialLinks(socialLinks);
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "isActive")) {
            updates.isActive = Boolean(isActive);
        }

        const section = await HomeSection.findOneAndUpdate(
            { sectionKey },
            updates,
            { new: true, upsert: true, runValidators: true, lean: true }
        );

        res.json({ success: true, section });
    } catch (err) {
        console.error("Error updating home section:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
