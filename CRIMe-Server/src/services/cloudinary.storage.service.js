// services/storage/cloudinary.storage.service.js
import cloudinary from '../../src/config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Uploads a file buffer to Cloudinary using a stream (no temp files on disk).
 * @param {Buffer} buffer - raw file buffer from multer memoryStorage
 * @param {Object} options - { folder, resourceType, filename }
 * @returns {Promise<Object>} Cloudinary result (secure_url, public_id, resource_type, bytes, etc.)
 */





export function uploadBufferToCloudinary(buffer, { folder, resourceType, filename }) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType, // 'image' | 'video' | 'raw'
        public_id: filename,          // optional: let Cloudinary auto-generate if omitted
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Deletes an asset from Cloudinary by public_id.
 * @param {string} publicId
 * @param {string} resourceType - 'image' | 'video' | 'raw'
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Maps a MIME type to Cloudinary's resource_type.
 * @param {string} mimeType
 * @returns {'image' | 'video' | 'raw'}
 */
export function getCloudinaryResourceType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'video'; // Cloudinary treats audio under 'video'
  return 'raw'; // pdf, zip, docs, etc.
}

/**
 * Maps a MIME type to your app-level fileType enum.
 * @param {string} mimeType
 * @returns {'IMAGE'|'VIDEO'|'AUDIO'|'PDF'|'DOCUMENT'}
 */
export function getAppFileType(mimeType) {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType === 'application/pdf') return 'PDF';
  return 'DOCUMENT';
}