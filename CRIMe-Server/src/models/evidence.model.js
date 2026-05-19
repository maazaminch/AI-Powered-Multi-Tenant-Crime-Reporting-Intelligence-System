//AWS S3
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

  // S3 object key
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

  // Bucket name
  bucketName: {
    type: String,
    required: true
  },

  // AWS region
  region: {
    type: String,
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

  uploadedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


// Indexes
EvidenceSchema.index({ tenantId: 1 });
EvidenceSchema.index({ caseId: 1 });

export default mongoose.model("Evidence", EvidenceSchema);

// AWS S3 Upload Flow

// Frontend
// → Requests presigned URL
// → Backend validates file
// → Backend generates S3 key + presigned URL
// → Frontend uploads directly to S3
// → Frontend sends metadata to backend
// → Backend stores metadata in MongoDB

// What Gets Stored
// {
//   "storageKey": "tenant-1/cases/case123/evidence/file.jpg",
//   "bucketName": "crime-saas-evidence",
//   "region": "ap-south-1",
//   "fileUrl": "https://bucket.s3.amazonaws.com/..."
// }





// //Cloudinary
// import mongoose from "mongoose";

// const EvidenceSchema = new mongoose.Schema({

//   // Tenant isolation
//   tenantId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Tenant",
//     required: true,
//     index: true
//   },

//   // Related case
//   caseId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Case",
//     required: true,
//     index: true
//   },

//   // Uploaded by user
//   uploadedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   },

//   // Cloudinary public ID
//   publicId: {
//     type: String,
//     required: true
//   },

//   // File URL
//   fileUrl: {
//     type: String,
//     required: true
//   },

//   // Original file details
//   originalFileName: {
//     type: String,
//     required: true
//   },

//   mimeType: {
//     type: String,
//     required: true
//   },

//   fileType: {
//     type: String,
//     enum: ["IMAGE", "VIDEO", "AUDIO", "PDF", "DOCUMENT"],
//     required: true
//   },

//   fileSize: {
//     type: Number,
//     required: true
//   },

//   uploadedAt: {
//     type: Date,
//     default: Date.now
//   }

// }, { timestamps: true });


// // Indexes
// EvidenceSchema.index({ tenantId: 1 });
// EvidenceSchema.index({ caseId: 1 });

// export default mongoose.model("Evidence", EvidenceSchema);

// Cloudinary Upload Flow

// Frontend
// → Select file
// → Send to backend
// → Backend uploads to Cloudinary
// → Cloudinary returns:

// secure_url
// public_id

// → Backend stores metadata in MongoDB

// What Gets Stored
// {
//   "publicId": "crime_saas/evidence/abc123",
//   "fileUrl": "https://res.cloudinary.com/...",
//   "fileType": "IMAGE"
// }









