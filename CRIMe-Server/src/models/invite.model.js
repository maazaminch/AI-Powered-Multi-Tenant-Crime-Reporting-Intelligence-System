
import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: true,
    index: true
  },

  role: {
    type: String,
    enum: ["ADMIN", "POLICE"],
    required: true
  },

  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: function() { return this.role === "POLICE"; }
  },

  stationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "PoliceStation"
},

  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  isUsed: {
    type: Boolean,
    default: false
  },

  usedAt: {
    type: Date,
    default: null
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true
  }

}, { timestamps: true });

export default mongoose.model("Invite", InviteSchema);