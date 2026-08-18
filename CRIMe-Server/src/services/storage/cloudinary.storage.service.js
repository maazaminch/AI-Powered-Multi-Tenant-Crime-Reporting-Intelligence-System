/**
 * Simple Cloudinary Storage Service
 * Uses unsigned upload preset for client-side uploads
 */

export default async function generateCloudinaryUploadParams(filename, type, purpose, referenceId) {
  // Check if Cloudinary cloud name is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME not set in .env file");
  }

  // Check for upload preset
  if (!process.env.CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("CLOUDINARY_UPLOAD_PRESET not set in .env file. Create an unsigned upload preset in Cloudinary dashboard.");
  }

  // Generate unique ID
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  let folder;
  let publicId;

  if (purpose === "profile") {
    folder = "crime_saas/profiles";
    publicId = `${folder}/${referenceId || "temp"}/${timestamp}_${randomString}_${sanitizedFilename}`;
  } else if (purpose === "evidence") {
    folder = "crime_saas/evidence";
    // Allow "temp" for guest uploads, otherwise use referenceId (caseId)
    publicId = `${folder}/${referenceId || "temp"}/${timestamp}_${randomString}_${sanitizedFilename}`;
  } else {
    throw new Error("Invalid purpose");
  }

  // Determine resource type
  let resourceType = 'auto';
  if (type.startsWith('image/')) resourceType = 'image';
  else if (type.startsWith('video/')) resourceType = 'video';

  // Simple upload URL
  const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  return {
    uploadUrl,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    publicId,
    folder,
    resourceType,
    key: publicId,
    storageKey: publicId,
    provider: 'cloudinary'
  };
}

/**
 * Determine Cloudinary resource type based on MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} Cloudinary resource type
 */
function getResourceType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'video'; // Cloudinary treats audio as video
  return 'auto'; // Let Cloudinary auto-detect
}

/**
 * Upload file from buffer (for server-side uploads)
 * @param {Buffer} fileBuffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export async function uploadBuffer(fileBuffer, options) {
  try {
    const result = await cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) throw error;
        return result;
      }
    );
    
    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type (image, video, etc.)
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFile(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
}