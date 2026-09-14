// routes/evidence/evidence.routes.js
import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import { uploadEvidence } from '../middlewares/multer.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import EvidenceController from '../controllers/evidence/evidence.controller.js';
import GuestEvidenceController from '../controllers/evidence/guestEvidence.controller.js';
import rateLimit from 'express-rate-limit';
import {
  uploadEvidenceSchema,
  uploadStandaloneEvidenceSchema,
  uploadGuestEvidenceSchema,
  uploadGuestStandaloneEvidenceSchema,
  getEvidenceSchema,
  getCaseEvidenceSchema,
  deleteEvidenceSchema
} from '../validations/evidence.schema.js';

const evidenceRouter = Router();

// Stricter rate limiting for upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Too many upload attempts, please try again later'
});

const guestUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 uploads per hour for guests
  message: 'Too many upload attempts, please try again later'
});

// Evidence retrieval and deletion (must come before parameterized routes)
evidenceRouter.get(
  '/case/:caseId',
  verifyJWT,
  validate(getCaseEvidenceSchema),
  EvidenceController.getCaseEvidence
);

evidenceRouter.get(
  '/:evidenceId',
  verifyJWT,
  validate(getEvidenceSchema),
  EvidenceController.getEvidence
);

evidenceRouter.delete(
  '/:evidenceId',
  verifyJWT,
  validate(deleteEvidenceSchema),
  EvidenceController.deleteEvidence
);

// Upload endpoints
evidenceRouter.post(
    '/upload-standalone',
    verifyJWT,
    uploadLimiter,
    uploadEvidence.array('files', 10),
    validate(uploadStandaloneEvidenceSchema),
    EvidenceController.uploadStandaloneEvidence
);

evidenceRouter.post(
  '/upload-evidence/:caseId',
  verifyJWT,
  uploadLimiter,
  uploadEvidence.array('files', 5),
  validate(uploadEvidenceSchema),
  EvidenceController.uploadEvidence
);

// Guest evidence routes
evidenceRouter.post(
  '/guest/upload-standalone',
  guestUploadLimiter,
  uploadEvidence.array('files', 10),
  validate(uploadGuestStandaloneEvidenceSchema),
  GuestEvidenceController.uploadGuestStandaloneEvidence
);

evidenceRouter.post(
  '/guest/upload-evidence/:trackingToken',
  guestUploadLimiter,
  uploadEvidence.array('files', 5),
  validate(uploadGuestEvidenceSchema),
  GuestEvidenceController.uploadGuestEvidence
);

export default evidenceRouter;