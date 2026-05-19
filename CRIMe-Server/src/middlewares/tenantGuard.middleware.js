import wrapAsync from "../utils/wrapAsync.js";
import Tenant from "../models/tenant.model.js";
import User from "../models/user.model.js";
import PoliceStation from "../models/policeStation.model.js";

// Tenant guard protects data boundaries.
// Role / permission guard protects authority boundaries.
const tenantGuard = wrapAsync(async (req, res, next) => {

    // Super Admin has global scope
    if (req.user.isSuperAdmin) {
      req.tenantFilter = {};
      req.stationFilter = {};
      return next();
    }
  
    if (!req.user.tenantId) {
      return res.status(403).json({ message: "Tenant context missing." });
    }
    
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
      return res.status(403).json({ message: "Tenant not found." });
    }
    if(!tenant.isActive) {
      return res.status(403).json({ message: "Tenant is not active." });
    }

    // Force tenant scope on all queries
    req.tenantFilter = { tenantId: req.user.tenantId };
  
    // Station-specific filtering based on user role
    if (req.user.isStationHead && req.user.policeStationId) {
      // Station heads see only their station
      req.stationFilter = { policeStationId: req.user.policeStationId };
    } else if (req.user.role === "POLICE" && req.user.policeStationId) {
      // Police see only their assigned cases from their station
      req.stationFilter = { 
        policeStationId: req.user.policeStationId,
        assignedTo: req.user._id 
      };
    } else {
      // Admins and others see tenant-wide (no station filter)
      req.stationFilter = {};
    }
  
    // Protect write payloads
    if (req.body?.tenantId && req.body.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: "Cross-tenant write blocked." });
    }

    // Protect station assignments in payloads
    if (req.body?.policeStationId && req.user.role !== "ADMIN" && !req.user.isSuperAdmin) {
      // Non-admin users cannot change station assignments
      const station = await PoliceStation.findById(req.body.policeStationId);
      if (!station || station.tenantId.toString() !== req.user.tenantId.toString()) {
        return res.status(403).json({ message: "Invalid station assignment." });
      }

      // Police and station heads can only use their own station
      if ((req.user.role === "POLICE" || req.user.isStationHead) && 
          req.body.policeStationId.toString() !== req.user.policeStationId?.toString()) {
        return res.status(403).json({ message: "You can only use your own station." });
      }
    }
  
    // Force payload tenantId
    if (req.body) {
    req.body.tenantId = req.user.tenantId || null;
    }
  
    next();
  });
  
export default tenantGuard;