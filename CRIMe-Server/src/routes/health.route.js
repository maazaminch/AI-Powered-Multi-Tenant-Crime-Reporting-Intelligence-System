import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "error",
    timestamp: new Date().toISOString(),
    database: databaseConnected ? "connected" : "disconnected"
  });
});

export default router;