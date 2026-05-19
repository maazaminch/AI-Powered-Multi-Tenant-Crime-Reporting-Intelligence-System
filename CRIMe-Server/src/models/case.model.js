import mongoose from "mongoose";
import apiError from "../utils/apiError.js";
import Tenant from "./tenant.model.js";
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
    required: true,
    unique: true,
    index: true
  },


  reportingMode: {
   type: String,
   enum: ["AUTHENTICATED", "GUEST"],
   default: "AUTHENTICATED"
  },

  // Evidences
  evidenceFiles: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence',
    required: false,
    default: []
   }],

  // ───── Reporter Identity ─────
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  reporterName: { type: String, required: function() { return this.reportingMode === "GUEST" } },
  reporterEmail: { type: String, required: function() { return this.reportingMode === "GUEST" } },
  reporterPhone: { type: String, required: function() { return this.reportingMode === "GUEST" } },

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
  addressText: { type: String },

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



const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  8
);




  CaseSchema.pre("validate", async function () {
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
