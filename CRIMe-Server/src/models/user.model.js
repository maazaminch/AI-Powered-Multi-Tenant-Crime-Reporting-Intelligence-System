

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // ─────────────── Tenant & Core ───────────────
  tenantId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Tenant",
  default: null
},

  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true , unique: true, trim: true, lowercase: true},
  phone: { type: String, required: true , unique: true, trim: true},
  password: { type: String, required: function() { return this.authProvider === "LOCAL"; } },
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


  // Refresh Token
  refreshTokenHash: { type: String, select: false },
  refreshTokenExpiresAt: { type: Date },
  refreshTokenFamily: { type: String }, // for token rotation tracking
  
  // Google OAuth
  googleId: { type: String, unique: true, sparse: true, index: true },
  authProvider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
  isEmailVerified: { type: Boolean, default: false },
  
  // ─────────────── Authentication ───────────────
  lastLogin: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastPasswordChangedAt: { type: Date },

  // ─────────────── Two-Factor Authentication ───────────────
  // twoFactorEnabled: { type: Boolean, default: false },
  // twoFactorSecret: { type: String }, // TOTP secret for Admin/Police


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
UserSchema.index({ isSuperAdmin: 1 }); 
UserSchema.index({ policeStationId: 1, isStationHead: 1 }); // SHO lookup
UserSchema.index({ tenantId: 1, status: 1 });               // pending approvals
UserSchema.index({ tenantId: 1, policeStationId: 1 });      // station police list
UserSchema.index({ isStationHead: 1 }); 


UserSchema.index({ refreshTokenExpiresAt: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { refreshTokenExpiresAt: { $exists: true } }
});

UserSchema.pre("save", function() {
  if (!this.dateOfBirth) return 
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.age = age;
  });


export default mongoose.model("User", UserSchema);


