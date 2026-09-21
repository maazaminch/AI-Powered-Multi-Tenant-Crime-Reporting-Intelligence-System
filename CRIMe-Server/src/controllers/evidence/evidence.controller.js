import crypto from 'crypto';
import wrapAsync from '../../utils/wrapAsync.js';
import apiError from '../../utils/apiError.js';
import apiResponse from '../../utils/apiResponse.js';
import Case from '../../models/case.model.js';
import Evidence from '../../models/evidence.model.js';
import {
  uploadBufferToCloudinary,
  getCloudinaryResourceType,
  getAppFileType,
  deleteFromCloudinary
} from '../../services/cloudinary.storage.service.js';

class EvidenceController {

  // its for reporting case
  static uploadStandaloneEvidence = wrapAsync(async (req, res) => {

    const currentUser = req.user;
    const files = req.files;

    if (!files || files.length === 0) {
      throw new apiError(400, "At least one file is required");
    }

    // Evidence count validation - max 10 files for standalone upload
    if (files.length > 10) {
      throw new apiError(400, "Maximum 10 files allowed per standalone upload");
    }

    // ---------------- Duplicate detection ----------------
    const fileHashes = files.map(file =>
      crypto.createHash('sha256').update(file.buffer).digest('hex')
    );

    const existingDuplicates = await Evidence.find({
      uploadedBy: currentUser._id,
      caseId: null,
      sha256Hash: { $in: fileHashes }
    }).select('originalFileName').lean();

    if (existingDuplicates.length > 0) {
      const dupeNames = existingDuplicates.map(d => d.originalFileName).join(', ');
      throw new apiError(409, `You've already uploaded: ${dupeNames}`);
    }

    const folder = `crime_saas/evidence/pending/${currentUser._id}`;
    const evidenceIds = [];

    for (const file of files) {
      try {
        const resourceType = getCloudinaryResourceType(file.mimetype);
        const appFileType = getAppFileType(file.mimetype);
        const sha256Hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

        const cloudinaryResult = await uploadBufferToCloudinary(file.buffer, { 
          folder, 
          resourceType, 
          filename: file.originalname 
        });

        const evidence = await Evidence.create({
          tenantId: currentUser.tenantId || null,
          caseId: null,                    // no case yet
          uploadedBy: currentUser._id,
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
          console.error('Upload failed for file:', file.originalname);
          console.error('Error name:', uploadError.name);
          console.error('Error message:', uploadError.message);
          console.error('Error details:', uploadError);

          throw new apiError(
            uploadError.statusCode || 500,
            `Failed to upload ${file.originalname}: ${uploadError.message}`
          );
        }
    }

    res.status(201).json(new apiResponse(201, { evidenceIds }, "Evidence uploaded successfully"));
  });

  // case already exists and again uploading eveidence
  static uploadEvidence = wrapAsync(async (req, res) => {

    const { caseId } = req.params; // case id
    const currentUser = req.user;
    const files = req.files; // from multer.array('files', 5)

    if (!files || files.length === 0) {
      throw new apiError(400, "At least one file is required");
    }

    // Evidence count validation - max 10 files per case upload
    if (files.length > 10) {
      throw new apiError(400, "Maximum 10 files allowed per case upload");
    }

    const caseDoc = await Case.findById(caseId)
      .select("tenantId reporter status assignedTo policeStationId allowCitizenEvidenceUpload")
      .lean();

    if (!caseDoc) {
      throw new apiError(404, "Case not found");
    }

    if (caseDoc.status !== "UNDER_INVESTIGATION") {
      throw new apiError(400, "Cannot add evidence to this case");
    }

    // Evidence count validation - max 10 files per case
    const currentEvidenceCount = caseDoc.evidenceFiles?.length || 0;
    if (currentEvidenceCount + files.length > 10) {
      throw new apiError(400, `Maximum 10 evidence files allowed per case. Currently: ${currentEvidenceCount}`);
    }

    // ---------------- Tenant isolation ----------------
    if (
      currentUser.tenantId &&
      caseDoc.tenantId.toString() !== currentUser.tenantId.toString()
    ) {
      throw new apiError(403, "Cross-tenant access not allowed");
    }

    // ---------------- Authorization ----------------
    if (currentUser.role === "CITIZEN") {
      // Check if officer has disabled citizen evidence uploads for this case
      if (!caseDoc.allowCitizenEvidenceUpload) {
        throw new apiError(400, "Officer has disabled citizen evidence uploads for this case");
      }
      
      if (
        !caseDoc.reporter?.citizenId ||
        caseDoc.reporter.citizenId.toString() !== currentUser._id.toString()
      ) {
        throw new apiError(403, "You are not allowed to add evidence to this case");
      }
    } else if (currentUser.isStationHead) {
      if (caseDoc.policeStationId?.toString() !== currentUser.policeStationId?.toString()) {
        throw new apiError(403, "Case not in your station");
      }
    } else if (currentUser.role === "POLICE") {
      if (caseDoc.assignedTo?.toString() !== currentUser._id.toString()) {
        throw new apiError(403, "Case not assigned to you");
      }
    } else if (currentUser.role === "ADMIN" || currentUser.isSuperAdmin) {
      throw new apiError(403, "Not allowed to add evidence");
    }

    // ---------------- Duplicate detection ----------------
    const fileHashes = files.map(file =>
      crypto.createHash('sha256').update(file.buffer).digest('hex')
    );

    const existingDuplicates = await Evidence.find({
      caseId: caseId,
      sha256Hash: { $in: fileHashes }
    }).select('originalFileName').lean();

    if (existingDuplicates.length > 0) {
      const dupeNames = existingDuplicates.map(d => d.originalFileName).join(', ');
      throw new apiError(409, `Duplicate file(s) already uploaded to this case: ${dupeNames}`);
    }

    // ---------------- Upload + persist each file ----------------
    const folder = `crime_saas/evidence/${caseDoc.tenantId}/${caseDoc._id}`;
    const evidenceIds = [];

    for (const file of files) {
      try {
        const resourceType = getCloudinaryResourceType(file.mimetype);
        const appFileType = getAppFileType(file.mimetype);

        // Hash computed server-side from the real buffer — trustworthy for chain-of-custody
        const sha256Hash = crypto
          .createHash('sha256')
          .update(file.buffer)
          .digest('hex');

        const cloudinaryResult = await uploadBufferToCloudinary(file.buffer, {
          folder,
          resourceType,
          filename: file.originalname
        });

        const evidence = await Evidence.create({
          tenantId: caseDoc.tenantId,
          caseId: caseId,
          uploadedBy: currentUser._id,
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

    await Case.findByIdAndUpdate(caseId, {
      $push: { evidenceFiles: { $each: evidenceIds } }
    });

    res.status(201).json(
      new apiResponse(201, { evidenceIds }, "Evidence uploaded successfully")
    );
  });

  // Get single evidence by ID
  static getEvidence = wrapAsync(async (req, res) => {
    const { evidenceId } = req.params;
    const currentUser = req.user;

    const evidence = await Evidence.findById(evidenceId)
      .populate('uploadedBy', 'fullName email')
      .lean();

    if (!evidence) {
      throw new apiError(404, "Evidence not found");
    }

    // Authorization checks
    if (currentUser.isSuperAdmin) {
      // SUPER_ADMIN: Full access - no check needed
    } else if (currentUser.role === "ADMIN") {
      // ADMIN: Tenant access only
      if (currentUser.tenantId?.toString() !== evidence.tenantId?.toString()) {
        throw new apiError(403, "Access denied - evidence not in your tenant");
      }
    } else if (currentUser.role === "POLICE" && currentUser.isStationHead) {
      // SHO: Station access only
      const caseDoc = await Case.findById(evidence.caseId).lean();
      if (!caseDoc || caseDoc.policeStationId?.toString() !== currentUser.policeStationId?.toString()) {
        throw new apiError(403, "Access denied - evidence not in your station");
      }
    } else if (currentUser.role === "POLICE") {
      // POLICE: Assigned case access only
      const caseDoc = await Case.findById(evidence.caseId).lean();
      if (!caseDoc || caseDoc.assignedTo?.toString() !== currentUser._id.toString()) {
        throw new apiError(403, "Access denied - evidence not in your assigned case");
      }
    } else if (currentUser.role === "CITIZEN") {
      // CITIZEN: Own case access only
      const caseDoc = await Case.findById(evidence.caseId).lean();
      if (!caseDoc || caseDoc.reporter.citizenId?.toString() !== currentUser._id.toString()) {
        throw new apiError(403, "Access denied - evidence not in your case");
      }
    } else {
      throw new apiError(403, "Access denied");
    }

    res.status(200).json(
      new apiResponse(200, evidence, "Evidence fetched successfully")
    );
  });

  // Get all evidence for a case
  static getCaseEvidence = wrapAsync(async (req, res) => {
    const { caseId } = req.params;
    const currentUser = req.user;

    // const caseDoc = await Case.findOne({ caseId }).lean();

    const filter = { 
      _id: caseId,
      ...req.tenantFilter,
      ...req.StationFilter
     };
    const caseDoc = await Case.findOne(filter).lean();
    if (!caseDoc) {
      throw new apiError(404, "Case not found");
    }

    // Authorization checks
    if (currentUser.isSuperAdmin) {
      // SUPER_ADMIN: Full access - no check needed
    } else if (currentUser.role === "ADMIN") {
      // ADMIN: Tenant access only
      if (currentUser.tenantId?.toString() !== caseDoc.tenantId?.toString()) {
        throw new apiError(403, "Access denied - case not in your tenant");
      }
    } else if (currentUser.role === "POLICE" && currentUser.isStationHead) {
      // SHO: Station access only
      if (caseDoc.policeStationId?.toString() !== currentUser.policeStationId?.toString()) {
        throw new apiError(403, "Access denied - case not in your station");
      }
    } else if (currentUser.role === "POLICE") {
      // POLICE: Assigned case access only
      if (caseDoc.assignedTo?.toString() !== currentUser._id.toString()) {
        throw new apiError(403, "Access denied - case not assigned to you");
      }
    } else if (currentUser.role === "CITIZEN") {
      // CITIZEN: Own case access only
      if (caseDoc.reporter.citizenId?.toString() !== currentUser._id.toString()) {
        throw new apiError(403, "Access denied - case not yours");
      }
    } else {
      throw new apiError(403, "Access denied");
    }

    // Single evidence retrieval after authorization
    const evidence = await Evidence.find({
      _id: { $in: caseDoc.evidenceFiles || [] },
      ...req.tenantFilter,
      ...req.StationFilter
    })
      .populate('uploadedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(
      new apiResponse(200, evidence, "Case evidence fetched successfully")
    );
  });

  // Delete standalone evidence (for citizens removing files before case submission)
  static deleteStandaloneEvidence = wrapAsync(async (req, res) => {
    const { evidenceId } = req.params;
    const currentUser = req.user;

    const evidence = await Evidence.findById(evidenceId).lean();
    if (!evidence) {
      throw new apiError(404, "Evidence not found");
    }

    // Authorization check - only the uploader can delete their standalone evidence
    if (evidence.uploadedBy?.toString() !== currentUser._id.toString()) {
      throw new apiError(403, "You can only delete evidence you uploaded");
    }

    // Only allow deletion of standalone evidence (not attached to a case)
    if (evidence.caseId !== null) {
      throw new apiError(400, "Cannot delete evidence that is already attached to a case");
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(evidence.publicId, evidence.resourceType);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion failed:', cloudinaryError.message);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await Evidence.findByIdAndDelete(evidenceId);

    res.status(200).json(
      new apiResponse(200, null, "Standalone evidence deleted successfully")
    );
  });

  // Delete evidence
  static deleteEvidence = wrapAsync(async (req, res) => {
    const { evidenceId } = req.params;
    const currentUser = req.user;

    const evidence = await Evidence.findById(evidenceId).lean();
    if (!evidence) {
      throw new apiError(404, "Evidence not found");
    }

    // Authorization check - only SHO can delete
    if (currentUser.role !== "POLICE" || !currentUser.isStationHead) {
      throw new apiError(403, "Only Station Heads can delete evidence");
    }

    // SHO: Station access only
    const caseDoc = await Case.findOne({ evidenceFiles: evidenceId }).lean();
    if (!caseDoc) {
      throw new apiError(404, "Associated case not found");
    }

    if (caseDoc.policeStationId?.toString() !== currentUser.policeStationId?.toString()) {
      throw new apiError(403, "Access denied - evidence not in your station");
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(evidence.publicId, evidence.resourceType);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion failed:', cloudinaryError.message);
      // Continue with database deletion even if Cloudinary fails
    }

    // Remove from case evidence array
    await Case.findByIdAndUpdate(caseDoc._id, { $pull: { evidenceFiles: evidenceId } });
    await Evidence.findByIdAndDelete(evidenceId);

    res.status(200).json(
      new apiResponse(200, null, "Evidence deleted successfully")
    );
  });

}

export default EvidenceController;