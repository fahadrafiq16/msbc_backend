const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const STATE_LABELS = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

async function ensureConnected() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    let waitMs = 0;
    while (mongoose.connection.readyState === 2 && waitMs < 5000) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitMs += 100;
    }
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}

async function checkMongoHealth(req, res) {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(200).json({
        success: false,
        connected: false,
        functional: false,
        message: "MONGODB_URI is not configured",
      });
    }

    await ensureConnected();

    const state = mongoose.connection.readyState;
    let pingOk = false;
    let pingError = null;

    try {
      const result = await mongoose.connection.db.admin().ping();
      pingOk = result?.ok === 1;
    } catch (err) {
      pingError = err.message;
    }

    const connected = state === 1;

    return res.status(200).json({
      success: connected && pingOk,
      connected,
      functional: pingOk,
      state,
      stateLabel: STATE_LABELS[state] || "unknown",
      pingOk,
      ...(pingError && { pingError }),
    });
  } catch (err) {
    console.error("[dbHealth] Health check failed:", err);
    return res.status(200).json({
      success: false,
      connected: false,
      functional: false,
      state: mongoose.connection.readyState,
      stateLabel: STATE_LABELS[mongoose.connection.readyState] || "unknown",
      error: err.message,
    });
  }
}

router.get("/health", checkMongoHealth);
router.get("/db-status", checkMongoHealth);

module.exports = router;
