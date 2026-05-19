
import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({

  // Tenant boundary (city / department)
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    index: true,
    required: true
  },

  // Who performed the action
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  actorRole: {
    type: String,
    enum: ["SUPER_ADMIN",
    "ADMIN",
    "STATION_HEAD",
    "POLICE",
    "CITIZEN",
    "GUEST"],
    required: true,
    index: true
  },

  // What happened
  action: {
    type: String,
    required: true,
    index: true
  },

  // On what object
  targetType: {
    type: String,
    enum: ["CASE", "USER", "TENANT", "EVIDENCE", "CASE_UPDATE"],
    required: true,
    index: true
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },

  // Immutable forensic metadata
  ipAddress: { type: String }, // shows where the update came from
  userAgent: { type: String }, // shows which device browser perform the action

  // Optional structured payload (old/new values)
  metadata: { type: Object },
  
}, { timestamps: true });


// ───────── Indexes for forensic reconstruction ─────────
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("AuditLog", AuditLogSchema);
