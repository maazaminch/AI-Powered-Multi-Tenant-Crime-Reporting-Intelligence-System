// controllers/evidence/guestEvidence.controller.js
import crypto from 'crypto';
import wrapAsync from '../../utils/wrapAsync.js';
import apiError from '../../utils/apiError.js';
import apiResponse from '../../utils/apiResponse.js';
import Case from '../../models/case.model.js';
import Evidence from '../../models/evidence.model.js';
import {
  uploadBufferToCloudinary,
  getCloudinaryResourceType,
  getAppFileType
} from '../../services/cloudinary.storage.service.js';

class GuestEvidenceController {

  // Guest standalone upload — before a case exists
    static uploadGuestStandaloneEvidence = wrapAsync(async (req, res) => {

        const { guestSessionId, trackingToken } = req.body;
        const files = req.files;

        if (!guestSessionId) {
            throw new apiError(400, "guestSessionId is required");
        }

        if (!files || files.length === 0) {
            throw new apiError(400, "At least one file is required");
        }

        // Evidence count validation - max 10 files for standalone upload
        if (files.length > 10) {
            throw new apiError(400, "Maximum 10 files allowed per standalone upload");
        }

        const folder = `crime_saas/evidence/pending_guest/${guestSessionId}`;
        const evidenceIds = [];

        for (const file of files) {
            try {
                const resourceType = getCloudinaryResourceType(file.mimetype);
                const appFileType = getAppFileType(file.mimetype);
                const sha256Hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

                const cloudinaryResult = await uploadBufferToCloudinary(file.buffer, { folder, resourceType });

                const evidence = await Evidence.create({
                tenantId: null,
                caseId: null,
                uploadedBy: null,
                guestSessionId,               // ownership tag for guests
                trackingToken: trackingToken || null,
                publicId: cloudinaryResult.public_id,
                fileUrl: cloudinaryResult.secure_url,
                folder,
                resourceType: cloudinaryResult.resource_type,
                originalFileName: file.originalname,
                mimeType: file.mimetype,
                fileType: appFileType,
                fileSize: file.size,
                sha256Hash,
                uploadIp: req.ip
                });

                evidenceIds.push(evidence._id);
            } catch (uploadError) {
                console.error('Upload failed for file:', file.originalname, uploadError.message);
                throw new apiError(500, `Failed to upload ${file.originalname}`);
            }
        }

        res.status(201).json(new apiResponse(201, { evidenceIds }, "Evidence uploaded successfully"));
    });

// Guest upload after case is created
    static uploadGuestEvidence = wrapAsync(async (req, res) => {

    const { trackingToken } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      throw new apiError(400, "At least one file is required");
    }

    // Evidence count validation - max 5 files per case upload
    if (files.length > 5) {
      throw new apiError(400, "Maximum 5 files allowed per case upload");
    }

    const caseDoc = await Case.findOne({ trackingToken })
      .select("tenantId reporter status")
      .lean();

    if (!caseDoc) {
      throw new apiError(404, "Case not found");
    }

    if (caseDoc.reporter.type !== "GUEST") {
      throw new apiError(403, "This upload path is for guest-reported cases only");
    }

    if (caseDoc.status === "CLOSED") {
      throw new apiError(400, "Cannot add evidence to a closed case");
    }

    // Evidence count validation - max 20 files per case
    const currentEvidenceCount = caseDoc.evidenceFiles?.length || 0;
    if (currentEvidenceCount + files.length > 20) {
      throw new apiError(400, `Maximum 20 evidence files allowed per case. Currently: ${currentEvidenceCount}`);
    }

    const folder = `crime_saas/evidence/${caseDoc.tenantId}/${caseDoc._id}`;
    const evidenceIds = [];

    for (const file of files) {
      try {
        const resourceType = getCloudinaryResourceType(file.mimetype);
        const appFileType = getAppFileType(file.mimetype);

        const sha256Hash = crypto
          .createHash('sha256')
          .update(file.buffer)
          .digest('hex');

        const cloudinaryResult = await uploadBufferToCloudinary(file.buffer, {
          folder,
          resourceType
        });

        const evidence = await Evidence.create({
          tenantId: caseDoc.tenantId,
          caseId: caseDoc._id,
          uploadedBy: null, // no user account
          trackingToken: trackingToken,
          publicId: cloudinaryResult.public_id,
          fileUrl: cloudinaryResult.secure_url,
          folder,
          resourceType: cloudinaryResult.resource_type,
          originalFileName: file.originalname,
          mimeType: file.mimetype,
          fileType: appFileType,
          fileSize: file.size,
          sha256Hash,
          uploadIp: req.ip
        });

        evidenceIds.push(evidence._id);
      } catch (uploadError) {
        console.error('Upload failed for file:', file.originalname, uploadError.message);
        throw new apiError(500, `Failed to upload ${file.originalname}`);
      }
    }

    await Case.findByIdAndUpdate(caseDoc._id, {
      $push: { evidenceFiles: { $each: evidenceIds } }
    });

    res.status(201).json(
      new apiResponse(201, { evidenceIds }, "Evidence uploaded successfully")
    );
    });

}

export default GuestEvidenceController;