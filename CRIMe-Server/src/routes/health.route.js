import express from "express";
import AuditLog from "../models/auditLog.model.js";

const router = express.Router();

// Health check route with audit system monitoring
router.get("/", async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const auditHealth = {
      enabled: process.env.AUDIT_ENABLED !== 'false',
      recentLogs: await AuditLog.countDocuments({
        createdAt: { $gte: fiveMinutesAgo }
      }),
      recentErrors: await AuditLog.countDocuments({
        createdAt: { $gte: fiveMinutesAgo },
        success: false
      })
    };

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      audit: auditHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

export default router;