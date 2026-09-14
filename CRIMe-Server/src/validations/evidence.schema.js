import Joi from 'joi';

import {
  requiredMongoIdSchema,
  optionalMongoIdSchema
} from './common.schema.js';

// ─────────────── UPLOAD EVIDENCE ───────────────

export const uploadEvidenceSchema = {
  params: Joi.object({
    caseId: requiredMongoIdSchema
  })
};

// ─────────────── UPLOAD STANDALONE EVIDENCE ───────────────

export const uploadStandaloneEvidenceSchema = {};

// ─────────────── UPLOAD GUEST EVIDENCE ───────────────

export const uploadGuestEvidenceSchema = {
  params: Joi.object({
    trackingToken: Joi.string()
      .min(10)
      .max(50)
      .required()
      .messages({
        'string.min': 'Tracking token must be at least 10 characters',
        'string.max': 'Tracking token cannot exceed 50 characters',
        'any.required': 'Tracking token is required'
      })
  }),

  body: Joi.object({
    guestSessionId: Joi.string()
      .min(10)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Guest session ID must be at least 10 characters',
        'string.max': 'Guest session ID cannot exceed 100 characters'
      }),

    trackingToken: Joi.string()
      .min(10)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Tracking token must be at least 10 characters',
        'string.max': 'Tracking token cannot exceed 50 characters'
      })
  })
};

// ─────────────── UPLOAD GUEST STANDALONE EVIDENCE ───────────────

export const uploadGuestStandaloneEvidenceSchema = {
  body: Joi.object({
    guestSessionId: Joi.string()
      .min(10)
      .max(100)
      .required()
      .messages({
        'string.min': 'Guest session ID must be at least 10 characters',
        'string.max': 'Guest session ID must be at least 10 characters',
        'string.max': 'Guest session ID cannot exceed 100 characters',
        'any.required': 'Guest session ID is required'
      }),

    trackingToken: Joi.string()
      .min(10)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Tracking token must be at least 10 characters',
        'string.max': 'Tracking token cannot exceed 50 characters'
      })
  })
};

// ─────────────── GET EVIDENCE BY ID ───────────────

export const getEvidenceSchema = {
  params: Joi.object({
    evidenceId: requiredMongoIdSchema
  })
};

// ─────────────── GET CASE EVIDENCE ───────────────

export const getCaseEvidenceSchema = {
  params: Joi.object({
    caseId: Joi.string()
      .pattern(/^CR-[A-Z0-9]{8}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid case ID format',
        'any.required': 'Case ID is required'
      })
  })
};

// ─────────────── DELETE EVIDENCE ───────────────

export const deleteEvidenceSchema = {
  params: Joi.object({
    evidenceId: requiredMongoIdSchema
  })
};

// ─────────────── EVIDENCE FILE IDS ───────────────

export const evidenceFileIdsSchema = {
  body: Joi.object({
    evidenceFileIds: Joi.array()
      .items(
        Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
      )
      .max(10)
      .optional()
      .messages({
        'array.max': 'Maximum 10 evidence files allowed',
        'string.pattern.base': 'Invalid evidence ID format'
      })
  })
};

export default {
  uploadEvidenceSchema,
  uploadStandaloneEvidenceSchema,
  uploadGuestEvidenceSchema,
  uploadGuestStandaloneEvidenceSchema,
  getEvidenceSchema,
  getCaseEvidenceSchema,
  deleteEvidenceSchema,
  evidenceFileIdsSchema
};