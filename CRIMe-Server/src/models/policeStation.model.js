import mongoose from "mongoose";
import generateStationCode from "../services/stationCode.service.js";

const PoliceStationSchema = new mongoose.Schema({

  // ─────────────── Tenant Link ───────────────
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true
  },

  // ─────────────── Basic Info ───────────────
  name: {  // Shalimar Police Station
    type: String,
    required: true,
    trim: true
  },

  code: {
    type: String,
    required: true,
    unique: true, // e.g., SHA-MUL-001
    trim: true
  },

  // ─────────────── Location ───────────────
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  },
  address: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true,
    index: true
  },
   
  sector: {
    type: String,
    required: true
  },
  // ─────────────── Contact Info ───────────────
  contactNumber: {
    type: String,
    required: true
  },

  email: {
    type: String
  },


  stationHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // ─────────────── Management ───────────────
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // ─────────────── Status ───────────────
  isActive: {
    type: Boolean,
    default: true
  },

  deletedAt: {
    type: Date
  }

}, { timestamps: true });

PoliceStationSchema.index({ location: "2dsphere" });

PoliceStationSchema.pre('validate', async function() {
  try {
    if (!this.code) {
      this.code = generateStationCode(this.name, this.city, this.sector);
    }
  } catch (err) {
    console.error("ACTUAL ERROR:", err);
  }
});

// ─────────────── INDEXES ───────────────

// Unique station per tenant
PoliceStationSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.model("PoliceStation", PoliceStationSchema);



//   area: {
//     type: String // optional locality
//   },

  // Optional (for future: maps / geo queries)
//   location: {
//     type: {
//       type: String,
//       enum: ["Point"],
//       default: "Point"
//     },
//     coordinates: {
//       type: [Number] // [longitude, latitude]
//     }
//   },