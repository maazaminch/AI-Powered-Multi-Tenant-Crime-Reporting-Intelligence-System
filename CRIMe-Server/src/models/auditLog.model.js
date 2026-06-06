
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

actor: {
  type: {
    type: String,
    enum: ["USER", "GUEST"],
    required: true,
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    default: null
  },

  role: {
    type: String,
    enum: ["ADMIN", "POLICE", "CITIZEN", null],
    default: null,
    index: true
  },

  flags: {
    isSuperadmin: Boolean,
    isStationHead: Boolean
  }
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

  description: { type: String }, // human readable description of the event
  targetName: { type: String }, // optional name for easier identification in logs (e.g. username, caseId)

  // Immutable forensic metadata
  ipAddress: { type: String }, // shows where the update came from
  userAgent: { type: String }, // shows which device browser perform the action

  statusCode: { type: Number }, // HTTP status code resulting from the action (if applicable)
  success: { type: Boolean }, // whether the action was successful or not
  
  // Optional structured payload (old/new values)
  metadata: { type: Object },
  
}, { timestamps: true });


// ───────── Indexes for forensic reconstruction ─────────
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model("AuditLog", AuditLogSchema);
