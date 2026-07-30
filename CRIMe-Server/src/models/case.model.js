import mongoose from "mongoose";
import apiError from "../utils/apiError.js";
import { customAlphabet } from "nanoid";

const CaseSchema = new mongoose.Schema({

  // ───── Tenant Isolation (City Anchor) ─────
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true
  },

  // ───── FIR / Case Identity ─────
  caseId: {
    type: String,
    unique: true,
  },

  // Evidences
  evidenceFiles: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence',
    required: false,
    default: []
   }],

  // ───── Reporter Identity (Unified) ─────
  reporter: {
    type: {
      type: String,
      enum: ["CITIZEN", "GUEST"],
      required: true
    },
    citizenId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      //required: function() { return this.type === "CITIZEN" }
    },
    fullName: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true 
    }
  },

  // ───── Crime Classification (CRITICAL) ─────
  crimeType: {
    type: String,
    enum: [
      "THEFT","ROBBERY","ASSAULT","MURDER","DOMESTIC_VIOLENCE",
      "CYBER_CRIME","KIDNAPPING","FRAUD","DRUG_OFFENSE",
      "HARASSMENT","TRAFFIC_VIOLATION","OTHER"
    ],
    required: true,
    index: true
  },

  //detected by AI
  severity: {
    type: String,
    enum: ["LOW","MEDIUM","HIGH","CRITICAL"],
    // required: true,
    index: true
  },

  // ───── Description & AI Layer ─────
  description: { type: String, required: true },
  aiSummary: { type: String },

  // ───── Geospatial Intelligence ─────
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  },
  locationLabel: { type: String, required: true },
  address: { type: String },

  // ───── Workflow & Assignment ─────
  status: {
  type: String,
  enum: [
    "PENDING",
    "ASSIGNED",
    "UNDER_INVESTIGATION",
    "RESOLVED",
    "CLOSED"
  ],
  default: "PENDING",
  index: true
},
  allowCitizenUpdates: { type: Boolean, default: true },

  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, 
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // SHO
  policeStationId: { type: mongoose.Schema.Types.ObjectId, ref: "PoliceStation", index: true },

  // PDF references
  receiptPdf: String,   // generated on submission
  fullPdf: String,      // generated after resolution


  // ───── Hotspot & Cold Storage ─────
  isHotspot: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  archivedAt: Date

}, { timestamps: true });


// Geospatial Engine
CaseSchema.index({ location: "2dsphere" });

// Tenant performance & dashboard indexes
CaseSchema.index({ tenantId: 1, createdAt: -1 });
CaseSchema.index({ tenantId: 1, status: 1 });
CaseSchema.index({ tenantId: 1, crimeType: 1 });
CaseSchema.index({ tenantId: 1, severity: 1 });

// Search indexes
CaseSchema.index({ "reporter.name": 1 });
CaseSchema.index({ "reporter.email": 1 });
CaseSchema.index({ "reporter.phone": 1 });

// System Analytics indexes
CaseSchema.index({ createdAt: 1 });

CaseSchema.index({ policeStationId: 1, status: 1, createdAt: -1 });
CaseSchema.index({ policeStationId: 1, crimeType: 1 });
CaseSchema.index({ policeStationId: 1, severity: 1 });
CaseSchema.index({ policeStationId: 1, assignedTo: 1 });
CaseSchema.index({ policeStationId: 1, isArchived: 1 });

const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  8
);




  CaseSchema.pre("validate", function () {
    try{
  // Generate only if missing
  if (!this.caseId) {
    this.caseId = `CR-${nanoid()}`;
  }

    } catch (err) {
      console.error("CaseId generation error:", err);
      throw new apiError(400, 'Failed to generate caseId' )      
    }
  });

export default mongoose.model("Case", CaseSchema);
