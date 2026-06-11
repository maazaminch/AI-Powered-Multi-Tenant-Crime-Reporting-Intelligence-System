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
  // Human-readable label chosen from the map search (e.g. Nominatim display_name)
  locationLabel: {
    type: String,
  },

  city: {
    type: String,
    required: true,
    index: true
  },
   
  sector: {
    type: String,
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



export default mongoose.model("PoliceStation", PoliceStationSchema);
