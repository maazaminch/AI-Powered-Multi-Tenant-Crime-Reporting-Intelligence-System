import mongoose from "mongoose";

const CaseUpdateSchema = new mongoose.Schema({

  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },

  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
    index: true
  },

  updaterRole: {
    type: String,
    enum: ["CITIZEN", "POLICE", "ADMIN"],
    required: true,
    index: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // 🔥 NEW FIELD
  updateType: {
    type: String,
    enum: ["STATUS_UPDATE", "NOTE", "EVIDENCE", "STATEMENT", "ARREST"],
    required: true,
    index: true
  },

  // Status tracking (only when needed)
  previousStatus: String,

  newStatus: {
    type: String,
    enum: [
      "PENDING",
      "ASSIGNED",
      "UNDER_INVESTIGATION",
      "RESOLVED",
      "CLOSED"
    ],
    required: function () {
      return this.updateType === "STATUS_UPDATE";
    },
    index: true
  },

  remarks: String,

  // 🔥 Investigation Data
  note: String,

  statement: {
    personName: String,
    statementText: String
  },

  arrest: {
    suspectName: String,
    details: String,
    arrestDate: Date
  },

  evidenceFiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evidence"
  }],

  // Audit
  ipAddress: String,
  userAgent: String,

  editedAt: { type: Date, default: Date.now },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

CaseUpdateSchema.index({ caseId: 1, createdAt: 1 });

export default mongoose.model('CaseUpdate', CaseUpdateSchema)