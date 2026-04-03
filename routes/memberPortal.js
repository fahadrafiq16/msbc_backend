const express = require("express");
const { createMollieClient } = require("@mollie/api-client");
const UserInfo = require("../models/UserInfo");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();
const mollieClient = createMollieClient({ apiKey: "test_5CWPTEtF4FBvUwEnRcW2fMxBMwUzqt" });

function toArray(r, key) {
  if (Array.isArray(r)) return r;
  if (r?._embedded?.[key]) return r._embedded[key];
  if (r?.[key]) return r[key];
  try { return [...r]; } catch { return []; }
}

router.get("/member-portal/me", authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== "member") {
      return res.status(403).json({ success: false, error: "Member access only" });
    }

    const memberId = req.user.id;
    const member = await UserInfo.findById(memberId).lean();
    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    const safeData = { ...member };
    delete safeData.memberPassword;

    let mollieProfile = null;
    const customerId = member.mollieCustomerId;
    if (customerId && customerId.startsWith("cst_")) {
      try {
        const [customer, subsResult, pmtsResult] = await Promise.all([
          mollieClient.customers.get(customerId),
          mollieClient.customers_subscriptions.page({ customerId }),
          mollieClient.customers_payments.page({ customerId }),
        ]);

        const subscriptions = toArray(subsResult, "subscriptions");
        const payments = toArray(pmtsResult, "payments");

        const paidPayments = payments
          .filter((p) => p?.status === "paid" && p?.paidAt)
          .sort((a, b) => (a.paidAt > b.paidAt ? 1 : -1));

        const activeSubscriptions = subscriptions
          .filter((s) => ["active", "pending"].includes(String(s?.status || "").toLowerCase()));

        const nextPaymentDates = activeSubscriptions.map((s) => s?.nextPaymentDate).filter(Boolean).sort();

        mollieProfile = {
          customerId,
          name: customer?.name || "",
          email: customer?.email || "",
          totalPayments: payments.length,
          paidPayments: paidPayments.length,
          firstPaymentAt: paidPayments[0]?.paidAt || null,
          lastPaymentAt: paidPayments.length > 0 ? paidPayments[paidPayments.length - 1]?.paidAt : null,
          nextPaymentDate: nextPaymentDates[0] || null,
          activeSubscriptionsCount: activeSubscriptions.length,
          subscriptions: activeSubscriptions.map((s) => ({
            id: s.id,
            description: s.description,
            amount: s.amount,
            interval: s.interval,
            status: s.status,
            nextPaymentDate: s.nextPaymentDate,
          })),
          recentPayments: payments.slice(0, 20).map((p) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            description: p.description,
            createdAt: p.createdAt,
            paidAt: p.paidAt,
            method: p.method,
          })),
        };
      } catch (err) {
        console.error("[memberPortal] Mollie fetch failed:", err.message);
      }
    }

    res.json({ success: true, member: safeData, mollieProfile });
  } catch (error) {
    console.error("[memberPortal] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
