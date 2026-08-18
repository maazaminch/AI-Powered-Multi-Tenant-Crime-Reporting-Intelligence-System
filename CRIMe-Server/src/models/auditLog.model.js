
import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({

  // Tenant boundary (city / department)
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
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
    isSuperAdmin: Boolean,
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
    enum: [
      "CASE",
      "CASE_UPDATE",
      "EVIDENCE",
      "USER",
      "TENANT",
      "POLICE_STATION",
      "NOTIFICATION",
      "ROLE_PERMISSION",
      "AUTH",
      "PROFILE",
      "STATION_ASSIGNMENT"
    ],
    required: true,
    index: true
  },

  module:{
  type:String,
  index:true
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
  
  // Production-level fields
  sessionId: { type: String, index: true },
  requestId: { type: String, index: true },
  sensitivity: { 
    type: String, 
    enum: ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"],
    default: "INTERNAL"
  },
  duration: { type: Number },
  errorMessage: { type: String }
  
}, { timestamps: true });


// ───────── Indexes for forensic reconstruction ─────────
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
AuditLogSchema.index({ 'actor.userId': 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model("AuditLog", AuditLogSchema);
