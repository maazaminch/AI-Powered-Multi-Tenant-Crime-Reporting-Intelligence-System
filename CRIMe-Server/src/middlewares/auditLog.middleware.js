// middleware/auditMiddleware.js

import AuditLog from "../models/auditLog.model.js";
import { resolveActorRole } from "../utils/resolveActorRole.js";

const auditAction = (
  action,
  targetType,
  getTargetId,
  getMetadata
) => {

  return (req, res, next) => {

    if (!req.user) return next();

    res.on("finish", async () => {

      try {

        await AuditLog.create({

          tenantId: req.user.tenantId,

          actorId: req.user._id,

          actorRole: resolveActorRole(req.user),

          action,

          targetType,

          targetId: getTargetId
            ? getTargetId(req)
            : null,

          ipAddress:
            req.ip ||
            req.headers["x-forwarded-for"] ||
            "unknown",

          userAgent:
            req.headers["user-agent"] ||
            "unknown",

          statusCode: res.statusCode,
          success: res.statusCode < 400,

          metadata: getMetadata
            ? getMetadata(req, res)
            : {}

        });

      } catch (err) {

        console.error(
          "Audit log failed:",
          err.message
        );
      }
    });

    next();
  };
};

export default auditAction;