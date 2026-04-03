const express = require("express");
const UserInfo = require("../models/UserInfo");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard-stats", authenticateToken, async (req, res) => {
  try {
    const allUsers = await UserInfo.find({}).sort({ createdAt: -1 }).lean();

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let weeklyRevenue = 0;
    let clubRevenue = 0;
    let ptRevenue = 0;
    let rentalRevenue = 0;
    let paidCount = 0;
    let openCount = 0;
    let clubCount = 0;
    let ptCount = 0;
    let rentalCount = 0;

    const outstandingMembers = [];
    const weeklyBuckets = new Map();
    const planRevenueMap = new Map();

    const RENTAL_TYPES = new Set(["rent", "pt-ruimte"]);

    for (const u of allUsers) {
      const amount = parseFloat(u.totalAmount) || 0;
      const isPaid = String(u.status || "").toLowerCase() === "paid";
      const created = u.createdAt ? new Date(u.createdAt) : null;
      const pt = String(u.selectedOption?.programType || "").toLowerCase();
      const isClub = pt === "club";
      const isPt = pt === "pttraining";
      const isRental = RENTAL_TYPES.has(pt);

      if (isClub) clubCount++;
      else if (isPt) ptCount++;
      else if (isRental) rentalCount++;

      if (isPaid) {
        paidCount++;
        totalRevenue += amount;

        if (created && created >= startOfMonth) monthlyRevenue += amount;
        if (created && created >= oneWeekAgo) weeklyRevenue += amount;
        if (isClub) clubRevenue += amount;
        else if (isPt) ptRevenue += amount;
        else if (isRental) rentalRevenue += amount;

        // Weekly trend (last 8 weeks)
        if (created && created >= eightWeeksAgo) {
          const weekStart = new Date(created);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
          const key = weekStart.toISOString().slice(0, 10);
          weeklyBuckets.set(key, (weeklyBuckets.get(key) || 0) + amount);
        }

        // Revenue by plan (trainingTitle)
        const planName = u.selectedOption?.trainingTitle || "Unknown";
        planRevenueMap.set(planName, (planRevenueMap.get(planName) || 0) + amount);
      } else {
        openCount++;
        if (outstandingMembers.length < 6) {
          outstandingMembers.push({
            id: String(u._id),
            firstName: u.voornaam || "",
            lastName: u.achternaam || "",
            email: u.email || "",
            amount,
            programType: pt,
          });
        }
      }
    }

    // Build sorted weekly trend array
    const weeklyTrend = [];
    const sortedWeeks = [...weeklyBuckets.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (const [weekDate, revenue] of sortedWeeks) {
      const d = new Date(weekDate);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      weeklyTrend.push({ week: label, revenue: Math.round(revenue * 100) / 100 });
    }

    // Build plan revenue array
    const planRevenue = [...planRevenueMap.entries()]
      .map(([plan, value]) => ({ plan, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);

    res.json({
      kpi: {
        weekly: Math.round(weeklyRevenue * 100) / 100,
        monthly: Math.round(monthlyRevenue * 100) / 100,
        total: Math.round(totalRevenue * 100) / 100,
        club: Math.round(clubRevenue * 100) / 100,
        pt: Math.round(ptRevenue * 100) / 100,
        rental: Math.round(rentalRevenue * 100) / 100,
      },
      weeklyTrend,
      payments: { paidCount, openCount },
      outstandingMembers,
      categoryRevenue: [
        { key: "CLUB", name: "Club", value: Math.round(clubRevenue * 100) / 100 },
        { key: "PT", name: "PT", value: Math.round(ptRevenue * 100) / 100 },
        { key: "RENTAL", name: "Rental", value: Math.round(rentalRevenue * 100) / 100 },
      ],
      planRevenue,
      registrations: { club: clubCount, pt: ptCount, rental: rentalCount },
      totalMembers: allUsers.length,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
