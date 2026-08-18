import Joi from 'joi';
import {
    requiredFullLocationSchema,
    reporterSchema,
    CrimeType,
    CaseStatus,
    Severity,
    requiredMongoIdSchema,
    optionalMongoIdSchema,
    paginationSchema
} from './common.schema.js';

// ─────────────── REPORT CASE (Citizen/Guest) ───────────────
export const reportCaseSchema = {
    body: Joi.object({
        reporter: reporterSchema,
        crimeType: Joi.string()
            .valid(...Object.values(CrimeType))
            .required()
            .messages({
                'any.only': `Crime type must be one of: ${Object.values(CrimeType).join(', ')}`,
                'any.required': 'Crime type is required'
            }),
        description: Joi.string()
            .min(10)
            .max(5000)
            .required()
            .messages({
                'string.min': 'Description must be at least 10 characters',
                'string.max': 'Description cannot exceed 5000 characters',
                'any.required': 'Description is required'
            }),
        location: requiredFullLocationSchema.location,
        locationLabel: requiredFullLocationSchema.locationLabel,
        address: Joi.string()
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Address cannot exceed 1000 characters'
            }),
        policeStationId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid police station ID format'
            }),
        allowCitizenUpdates: Joi.boolean()
            .default(true)
            .optional()
    })
};

// ─────────────── GET CASE DETAILS ───────────────
export const getCaseDetailsSchema = {
    params: Joi.object({
        caseId: Joi.string()
            .required()
            .messages({
                'any.required': 'Case ID is required'
            })
    })
};

// ─────────────── GET CASE UPDATES ───────────────
export const getCaseUpdatesSchema = {
    params: Joi.object({
        caseId: Joi.string()
            .required()
            .messages({
                'any.required': 'Case ID is required'
            })
    }),
    query: Joi.object({
        ...paginationSchema
    })
};

// ─────────────── UPDATE CASE STATUS ───────────────
export const updateCaseStatusSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    body: Joi.object({
        status: Joi.string()
            .valid(...Object.values(CaseStatus))
            .required()
            .messages({
                'any.only': `Status must be one of: ${Object.values(CaseStatus).join(', ')}`,
                'any.required': 'Status is required'
            }),
        remarks: Joi.string()
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Remarks cannot exceed 1000 characters'
            })
    })
};

// ─────────────── ASSIGN CASE ───────────────
export const assignCaseSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    body: Joi.object({
        assignedTo: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid user ID format',
                'any.required': 'Assigned user ID is required'
            })
    })
};

// ─────────────── GET CITIZEN CASES ───────────────
export const getCitizenCasesSchema = {
    query: Joi.object({
        status: Joi.string()
            .valid(...Object.values(CaseStatus))
            .optional()
            .messages({
                'any.only': `Status must be one of: ${Object.values(CaseStatus).join(', ')}`
            }),
        ...paginationSchema
    })
};

// ─────────────── GET MY CASES (Police) ───────────────
export const getMyCasesSchema = {
    query: Joi.object({
        status: Joi.string()
            .valid(...Object.values(CaseStatus))
            .optional()
            .messages({
                'any.only': `Status must be one of: ${Object.values(CaseStatus).join(', ')}`
            }),
        severity: Joi.string()
            .valid(...Object.values(Severity))
            .optional()
            .messages({
                'any.only': `Severity must be one of: ${Object.values(Severity).join(', ')}`
            }),
        ...paginationSchema
    })
};

// ─────────────── GET TENANT CASES (Admin) ───────────────
export const getTenantCasesSchema = {
    query: Joi.object({
        status: Joi.string()
            .valid(...Object.values(CaseStatus))
            .optional()
            .messages({
                'any.only': `Status must be one of: ${Object.values(CaseStatus).join(', ')}`
            }),
        crimeType: Joi.string()
            .valid(...Object.values(CrimeType))
            .optional()
            .messages({
                'any.only': `Crime type must be one of: ${Object.values(CrimeType).join(', ')}`
            }),
        severity: Joi.string()
            .valid(...Object.values(Severity))
            .optional()
            .messages({
                'any.only': `Severity must be one of: ${Object.values(Severity).join(', ')}`
            }),
        policeStationId: optionalMongoIdSchema,
        ...paginationSchema
    })
};

// ─────────────── ADD NOTE TO CASE ───────────────
export const addNoteSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    body: Joi.object({
        note: Joi.string()
            .min(5)
            .max(2000)
            .required()
            .messages({
                'string.min': 'Note must be at least 5 characters',
                'string.max': 'Note cannot exceed 2000 characters',
                'any.required': 'Note is required'
            })
    })
};

// ─────────────── SUGGEST NEAREST STATIONS ───────────────
export const suggestNearestStationsSchema = {
    query: Joi.object({
        latitude: Joi.number()
            .min(-90)
            .max(90)
            .required()
            .messages({
                'number.min': 'Latitude must be between -90 and 90',
                'number.max': 'Latitude must be between -90 and 90',
                'any.required': 'Latitude is required'
            }),
        longitude: Joi.number()
            .min(-180)
            .max(180)
            .required()
            .messages({
                'number.min': 'Longitude must be between -180 and 180',
                'number.max': 'Longitude must be between -180 and 180',
                'any.required': 'Longitude is required'
            }),
        radius: Joi.number()
            .min(1)
            .max(50)
            .default(10)
            .optional()
            .messages({
                'number.min': 'Radius must be at least 1 km',
                'number.max': 'Radius cannot exceed 50 km'
            })
    })
};
