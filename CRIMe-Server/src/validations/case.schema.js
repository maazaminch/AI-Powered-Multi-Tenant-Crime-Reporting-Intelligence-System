import Joi from 'joi';
import {
    CrimeType,
    CaseStatus,
    Severity,
    mongoIdSchema,
    requiredMongoIdSchema,
    optionalMongoIdSchema,
    paginationSchema,
    coordinatesValidator,
    emailSchema
} from './common.schema.js';

const reportCaseFields = {
    crimeType: Joi.string()
        .valid(...Object.values(CrimeType))
        .required()
        .messages({
            'any.only': `Crime type must be one of: ${Object.values(CrimeType).join(', ')}`,
            'any.required': 'Crime type is required'
        }),
    description: Joi.string()
        .trim()
        .min(1)
        .max(5000)
        .required()
        .messages({
            'string.min': 'Description is required',
            'string.max': 'Description cannot exceed 5000 characters',
            'any.required': 'Description is required'
        }),
    coordinates: Joi.array()
        .length(2)
        .items(Joi.number().required())
        .required()
        .custom(coordinatesValidator)
        .messages({
            'array.length': 'Coordinates must have exactly 2 values [longitude, latitude]',
            'any.invalid': 'Invalid coordinate values',
            'any.required': 'Coordinates are required'
        }),
    locationLabel: Joi.string()
        .trim()
        .max(500)
        .required()
        .messages({
            'string.max': 'Location label cannot exceed 500 characters',
            'any.required': 'Location label is required'
        }),
    address: Joi.string()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Address cannot exceed 1000 characters'
        }),
    policeStationId: requiredMongoIdSchema,
    evidenceFileIds: Joi.array()
        .items(mongoIdSchema)
        .max(10)
        .optional()
        .messages({
            'array.max': 'Maximum 10 evidence files allowed'
        })
};

// ─────────────── REPORT CASE (Citizen) ───────────────
export const reportCaseSchema = {
    body: Joi.object(reportCaseFields)
};

// ─────────────── REPORT CASE (Guest) ───────────────
export const reportGuestCaseSchema = {
    body: Joi.object({
        ...reportCaseFields,
        sessionId: Joi.string().required(),
        guestSessionId: Joi.string().when('evidenceFileIds', {
            is: Joi.array().min(1),
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        name: Joi.string().trim().min(1).max(100).required(),
        email: emailSchema.required(),
        phone: Joi.string().trim().min(1).max(30).required()
    })
};

// ─────────────── GET CASE DETAILS ───────────────
export const getCaseDetailsSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    })
};

// ─────────────── GET CASE UPDATES ───────────────
export const getCaseUpdatesSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    query: Joi.object({
        ...paginationSchema(10)
    })
};

// ─────────────── UPDATE CASE STATUS ───────────────
export const updateCaseStatusSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    body: Joi.object({
        newStatus: Joi.string()
            .valid(CaseStatus.UNDER_INVESTIGATION, CaseStatus.RESOLVED)
            .required()
            .messages({
                'any.only': 'Police can only update status to UNDER_INVESTIGATION or RESOLVED',
                'any.required': 'New status is required'
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
        policeId: requiredMongoIdSchema
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
        search: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'Search term cannot exceed 100 characters'
            }),
        ...paginationSchema(10)
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
        crimeType: Joi.string()
            .valid(...Object.values(CrimeType))
            .optional()
            .messages({
                'any.only': `Crime type must be one of: ${Object.values(CrimeType).join(', ')}`
            }),
        search: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'Search term cannot exceed 100 characters'
            }),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        sortBy: Joi.string()
            .valid('createdAt')
            .optional(),
        sortOrder: Joi.string()
            .valid('asc', 'desc')
            .optional(),
        ...paginationSchema(10)
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
        assignedTo: optionalMongoIdSchema,
        reporterType: Joi.string()
            .valid('CITIZEN', 'GUEST')
            .optional(),
        search: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'Search term cannot exceed 100 characters'
            }),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        sortBy: Joi.string()
            .valid('createdAt', 'severity', 'status', 'crimeType', 'caseId')
            .optional(),
        sortOrder: Joi.string()
            .valid('asc', 'desc')
            .optional(),
        ...paginationSchema(10)
    })
};

// ─────────────── ADD NOTE TO CASE ───────────────
export const addNoteSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    body: Joi.object({
        note: Joi.string()
            .trim()
            .min(1)
            .max(2000)
            .required()
            .messages({
                'string.min': 'Note is required',
                'string.max': 'Note cannot exceed 2000 characters',
                'any.required': 'Note is required'
            })
    })
};

export const addGuestNoteSchema = {
    params: Joi.object({
        caseId: Joi.string().min(1).max(50).required()
    }),
    body: Joi.object({
        trackingToken: Joi.string().min(10).max(50).required(),
        note: Joi.string().trim().min(1).max(2000).required()
    })
};

export const guestCaseAccessSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    query: Joi.object({
        trackingToken: Joi.string().min(10).max(50).required()
    })
};

export const guestTrackCaseSchema = {
    params: Joi.object({
        caseId: Joi.string().min(1).max(50).required()
    }),
    query: Joi.object({
        trackingToken: Joi.string().min(10).max(50).required()
    })
};

export const closeCaseStatusSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    body: Joi.object({
        remarks: Joi.string().max(1000).optional()
    })
};

// ─────────────── SUGGEST NEAREST STATIONS ───────────────
export const suggestNearestStationsSchema = {
    query: Joi.object({
        lat: Joi.number()
            .min(-90)
            .max(90)
            .required()
            .messages({
                'number.min': 'Latitude must be between -90 and 90',
                'number.max': 'Latitude must be between -90 and 90',
                'any.required': 'Latitude is required'
            }),
        lng: Joi.number()
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

export const toggleCitizenEvidenceUploadSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    })
};
