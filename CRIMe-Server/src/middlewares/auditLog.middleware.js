import AuditLog from "../models/auditLog.model.js";

const auditAction = (
  action,
  targetType,
  getTargetId,
  getMetadata
) => {
  return (req, res, next) => {
    res.on("finish", async () => {
      try {
        const isAuthenticated = !!req.user;

        await AuditLog.create({
          tenantId: req.user?.tenantId || null,

          // ✅ unified actor model (USER or GUEST)
          actor: {
            type: isAuthenticated ? "USER" : "GUEST",
            userId: req.user?._id || null,
            role: req.user?.role || null,
            flags: {
              isSuperadmin: req.user?.isSuperadmin || false,
              isStationHead: req.user?.isStationHead || false,
            },
          },

          action,
          targetType,

          targetId: getTargetId ? getTargetId(req) : null,

          ipAddress:
            req.headers["x-forwarded-for"] ||
            req.ip ||
            "unknown",

          userAgent: req.headers["user-agent"] || "unknown",

          statusCode: res.statusCode,
          success: res.statusCode < 400,

          metadata: getMetadata ? getMetadata(req, res) : {},
        });
      } catch (err) {
        console.error("Audit log failed:", err.message);
      }
    });

    next();
  };
};

export default auditAction;