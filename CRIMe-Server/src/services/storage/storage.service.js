/**
 * Storage Service Abstraction Layer
 * Supports multiple storage providers (S3, Cloudinary, etc.)
 * Switch between providers using STORAGE_PROVIDER environment variable
 */

import generateS3PresignedUrl from './s3.storage.service.js';
import generateCloudinaryUploadParams from './cloudinary.storage.service.js';

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'cloudinary';

/**
 * Generate upload parameters based on the configured storage provider
 * @param {string} filename - Original filename
 * @param {string} type - MIME type
 * @param {string} purpose - 'profile' or 'evidence'
 * @param {string} referenceId - User ID (for profile) or Case ID (for evidence)
 * @returns {Promise<Object>} Upload parameters (uploadUrl, fileUrl, storageKey, etc.)
 */
export async function generateUploadParams(filename, type, purpose, referenceId) {
  switch (STORAGE_PROVIDER.toLowerCase()) {
    case 'cloudinary':
      return await generateCloudinaryUploadParams(filename, type, purpose, referenceId);
    
    case 's3':
    default:
      return await generateS3PresignedUrl(filename, type, purpose, referenceId);
  }
}

/**
 * Delete file from storage
 * @param {string} storageKey - Storage key or public ID
 * @param {string} provider - Optional provider override
 */
export async function deleteFile(storageKey, provider = STORAGE_PROVIDER) {
  switch (provider.toLowerCase()) {
    case 'cloudinary':
      // Cloudinary deletion logic to be implemented
      console.log('Cloudinary delete not implemented yet');
      break;
    
    case 's3':
    default:
      // S3 deletion logic to be implemented
      console.log('S3 delete not implemented yet');
      break;
  }
}

export default {
  generateUploadParams,
  deleteFile
};