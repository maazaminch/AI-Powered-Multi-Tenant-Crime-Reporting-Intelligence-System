// Multi-Storage Support (S3, Cloudinary, etc.)
import mongoose from "mongoose";

const EvidenceSchema = new mongoose.Schema({

  // Tenant isolation
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true
  },

  // Related case
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Case",
    required: true,
    index: true
  },

  // Uploaded by user
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Storage provider (s3, cloudinary, etc.)
  provider: {
    type: String,
    required: true,
    enum: ['s3', 'cloudinary'],
    default: 's3'
  },

  // Storage key (S3 key or Cloudinary public ID)
  storageKey: {
    type: String,
    required: true,
    unique: true
  },

  // Public or signed URL
  fileUrl: {
    type: String,
    required: true
  },

  // S3 specific fields (optional, for backward compatibility)
  bucketName: {
    type: String
  },

  region: {
    type: String
  },

  storageClass: {
    type: String,
    default: "STANDARD"
  },

  // Cloudinary specific fields (optional)
  publicId: {
    type: String
  },

  folder: {
    type: String
  },

  resourceType: {
    type: String
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

  fileType: {
    type: String,
    enum: ["IMAGE", "VIDEO", "AUDIO", "PDF", "DOCUMENT"],
    required: true
  },

  fileSize: {
    type: Number,
    required: true
  },

  // Optional integrity check
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


// Indexes
EvidenceSchema.index({ tenantId: 1 });
EvidenceSchema.index({ caseId: 1 });
EvidenceSchema.index({ provider: 1 });

export default mongoose.model("Evidence", EvidenceSchema);