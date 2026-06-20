

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // ─────────────── Tenant & Core ───────────────
  tenantId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Tenant",
  required: false,
  index: true
},

  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true , unique: true, trim: true},
  phone: { type: String, required: true , unique: true, trim: true},
  password: { type: String, required: true },
  // confirmPassword: {type: String, required: true}, its only required in frontend
  profilePictureUrl: { 
    type: String, 
    //required: true 
  },
  gender: { type: String, enum: ["MALE", "FEMALE"], required: true },
  role: { type: String, enum: ["CITIZEN", "POLICE", "ADMIN"], required: true, index: true },
  status: { type: String, enum: ["PENDING", "APPROVED", "BLOCKED", "REJECTED"], default: "PENDING" },


  isSuperAdmin: { type: Boolean, default: false },



  // ─────────────── Police Specific Fields ───────────────
  badgeNumber: { 
    type: String, 
    required: function() { return this.role === "POLICE"; }, 
    unique: true, 
    sparse: true,
    index: true 
  },
  policeStationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PoliceStation",
    default: null,
    index: true
  },
  isStationHead: {
    type: Boolean,
    default: false,
  },



    // ─────────────── International Fields ───────────────
    dateOfBirth: { type: Date, required: true },
    age: {type: Number },
    address: { type: String },
    idType: { type: String, enum: ["PASSPORT", "DRIVER_LICENSE", "NATIONAL_ID"], required: true },
    nationalIdHash: { type: String, required: true, index: true },

  // ─────────────── Authentication ───────────────
  lastLogin: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastPasswordChangedAt: { type: Date },

  // ─────────────── Two-Factor Authentication ───────────────
  // twoFactorEnabled: { type: Boolean, default: false },
  // twoFactorSecret: { type: String }, // TOTP secret for Admin/Police

  // ─────────────── Email Verification / OTP ───────────────
  //isEmailVerified: { type: Boolean, default: false },
  //emailVerificationOtpHash: { type: String }, // hashed OTP
  //emailVerificationExpires: { type: Date },



  // ─────────────── Governance / Audit ───────────────
    
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  invitedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  blockedAt: { type: Date },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectedAt: { type: Date },

  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt: { type: Date }

}, { timestamps: true });

// ─────────────── INDEXES ───────────────
UserSchema.index({ tenantId: 1, role: 1 }); // fast tenant-role queries
UserSchema.index({ tenantId: 1, fullName: 1, role: 1 });
UserSchema.index({ tenantId: 1, fullName: 1 }); 


UserSchema.pre("save", async function() {
  try {
   
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  } 
  } catch (error) {
   console.log(error) 
  }
  
});


export default mongoose.model("User", UserSchema);


