/**
 * S3 Storage Service
 * Wraps existing S3 functionality for the storage abstraction layer
 */

import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Generate S3 presigned URL for upload
 * @param {string} filename - Original filename
 * @param {string} type - MIME type
 * @param {string} purpose - 'profile' or 'evidence'
 * @param {string} referenceId - User ID (for profile) or Case ID (for evidence)
 * @returns {Promise<Object>} Upload parameters
 */
export default async function generateS3PresignedUrl(filename, type, purpose, referenceId) {
  let key;
  let bucket;

  if (purpose === "profile") {
    key = `profiles/${referenceId || "temp"}/${Date.now()}_${filename}`;
    bucket = process.env.PROFILE_BUCKET;
  } else if (purpose === "evidence") {
    // Allow "temp" for guest uploads, otherwise use referenceId (caseId)
    key = `evidence/${referenceId || "temp"}/${Date.now()}_${filename}`;
    bucket = process.env.EVIDENCE_BUCKET;
  } else {
    throw new Error("Invalid purpose");
  }

  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 300, // 5 minutes
    ContentType: type,
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { 
    uploadUrl, 
    fileUrl, 
    key, // Changed from storageKey to key for frontend compatibility
    storageKey: key, // Keep storageKey for database compatibility
    bucket,
    region: process.env.AWS_REGION,
    provider: 's3'
  };
}