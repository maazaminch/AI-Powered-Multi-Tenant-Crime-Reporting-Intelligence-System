// Cloudinary Storage - Evidence Model
import mongoose from "mongoose";

const EvidenceSchema = new mongoose.Schema({

  // Tenant isolation
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    default: null,
    index: true
  },

  // Related case
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
    default: null,
    index: true
  },

  // Uploaded by user
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  trackingToken: { type: String, index: true, sparse: true },
  guestSessionId: { type: String, index: true, sparse: true },

  // Cloudinary public ID — used to delete/manage the asset later
  publicId: {
    type: String,
    required: true,
    unique: true
  },

  // Cloudinary secure_url — what you actually render/download
  fileUrl: {
    type: String,
    required: true
  },

  // Cloudinary folder path (e.g. crime_saas/evidence/<caseId>)
  folder: {
    type: String,
    required: true
  },

  // image | video | raw (Cloudinary's own classification)
  resourceType: {
    type: String,
    enum: ["image", "video", "raw"],
    required: true
  },

  // File details
  originalFileName: {
    type: String,
    required: true
  },

  mimeType: {
    type: String,
    required: true
  },

  // Your app-level classification (separate from Cloudinary's resourceType)
  fileType: {
    type: String,
    enum: ["IMAGE", "VIDEO", "AUDIO", "PDF", "DOCUMENT"],
    required: true
  },

  fileSize: {
    type: Number,
    required: true
  },

  // Integrity check — recommended to verify server-side, see note below
  sha256Hash: {
    type: String
  },

  uploadIp: {
    type: String
  },

  uploadedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


export default mongoose.model("Evidence", EvidenceSchema);