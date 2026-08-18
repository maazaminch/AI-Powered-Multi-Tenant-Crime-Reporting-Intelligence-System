import AuditLog from "../models/auditLog.model.js";
import crypto from 'crypto';

// Configuration for what to auto-capture
const AUDIT_CONFIG = {
  // Safe fields to auto-capture from req.body
  safeFields: ['name', 'title', 'status', 'type', 'priority', 'description'],
  
  // Sensitive fields to never capture
  sensitiveFields: ['password', 'token', 'secret', 'apiKey', 'creditCard'],
  
  // Routes to exclude from audit logging
  excludeRoutes: ['/health', '/ping', '/favicon.ico'],
  
  // Minimum log level (optional future enhancement)
  logLevel: process.env.AUDIT_LOG_LEVEL || 'INFO'
};

const auditLog = (action, targetType) => {
  return (req, res, next) => {
    // Skip excluded routes
    if (AUDIT_CONFIG.excludeRoutes.some(route => req.path.startsWith(route))) {
      return next();
    }

    // Skip if audit logging is disabled
    if (process.env.AUDIT_ENABLED === 'false') {
      return next();
    }

    // Generate unique request ID
    const requestId = crypto.randomUUID();
    req.requestId = requestId;
    
    const startTime = Date.now();

    res.on("finish", async () => {
      try {
        // Don't block the response - use setImmediate
        setImmediate(async () => {
          try {
            const duration = Date.now() - startTime;
            
            // Auto-detect target ID
            const targetId = req.params?.id || req.body?._id?.toString() || req.body?.id;
            
            // Auto-capture safe metadata
            const metadata = {};
            AUDIT_CONFIG.safeFields.forEach(field => {
              if (req.body && req.body[field] !== undefined) {
                metadata[field] = req.body[field];
              }
            });

            // Auto-detect module from route path
            const pathParts = req.path.split('/').filter(Boolean);
            const module = pathParts[0] || 'unknown';

            // IP address extraction (handle proxies)
            const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                           req.headers['x-real-ip'] || 
                           req.connection?.remoteAddress || 
                           req.ip || 
                           'unknown';

            // Determine sensitivity based on action and target type
            const sensitivity = determineSensitivity(action, targetType);

            await AuditLog.create({
              tenantId: req.user?.tenantId || null,
              
              actor: {
                type: req.user ? "USER" : "GUEST",
                userId: req.user?._id || null,
                role: req.user?.role || null,
                flags: {
                  isSuperAdmin: req.user?.isSuperAdmin || false,
                  isStationHead: req.user?.isStationHead || false,
                },
              },
              
              action,
              targetType,
              targetId,
              module,
              
              // Auto-populated fields
              description: generateDescription(action, targetType, targetId),
              targetName: extractTargetName(req),
              
              // Forensic metadata
              ipAddress,
              userAgent: req.headers['user-agent'] || 'unknown',
              statusCode: res.statusCode,
              success: res.statusCode < 400,
              duration,
              sensitivity,
              
              // Request tracking
              requestId,
              sessionId: req.sessionID || req.headers['x-session-id'],
              
              // Safe metadata only
              metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
              
              // Error details if failed
              errorMessage: res.statusCode >= 400 ? res.statusMessage : undefined,
            });
          } catch (err) {
            // Never let audit logging break the application
            console.error("Audit log failed:", err.message);
          }
        });
      } catch (err) {
        console.error("Audit log setup failed:", err.message);
      }
    });

    next();
  };
};

// Helper functions
function determineSensitivity(action, targetType) {
  const highSensitivity = ['DELETE', 'UPDATE', 'LOGIN', 'AUTH'];
  const highSensitivityTargets = ['USER', 'AUTH', 'TENANT', 'ROLE_PERMISSION'];
  
  if (highSensitivity.includes(action) || highSensitivityTargets.includes(targetType)) {
    return 'CONFIDENTIAL';
  }
  return 'INTERNAL';
}

function generateDescription(action, targetType, targetId) {
  const actionPast = {
    'CREATE': 'created',
    'UPDATE': 'updated', 
    'DELETE': 'deleted',
    'LOGIN': 'logged in',
    'LOGOUT': 'logged out',
    'UPLOAD': 'uploaded',
    'DOWNLOAD': 'downloaded'
  }[action] || action.toLowerCase();
  
  return `${targetType} ${actionPast}${targetId ? ` (${targetId})` : ''}`;
}

function extractTargetName(req) {
  // Try to extract a human-readable name from the request
  if (req.body?.name) return req.body.name;
  if (req.body?.title) return req.body.title;
  if (req.body?.username) return req.body.username;
  if (req.body?.email) return req.body.email;
  return undefined;
}

// Optional: Advanced version for special cases
auditLog.advanced = (action, targetType, options = {}) => {
  return (req, res, next) => {
    // Store custom options for the basic middleware to use
    req.auditOptions = {
      customTargetId: options.targetId ? options.targetId(req) : undefined,
      customMetadata: options.metadata ? options.metadata(req, res) : undefined,
      customDescription: options.description
    };
    
    return auditLog(action, targetType)(req, res, next);
  };
};

export default auditLog;