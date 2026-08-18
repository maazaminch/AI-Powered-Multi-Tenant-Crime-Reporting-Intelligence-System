import Joi from 'joi';
import {
    requiredMongoIdSchema,
    optionalMongoIdSchema,
    UpdateType,
    Visibility,
    CaseStatus,
    paginationSchema
} from './common.schema.js';

// ─────────────── ADD CASE UPDATE (Police) ───────────────
export const addCaseUpdateSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    body: Joi.object({
        updateType: Joi.string()
            .valid(...Object.values(UpdateType))
            .required()
            .messages({
                'any.only': `Update type must be one of: ${Object.values(UpdateType).join(', ')}`,
                'any.required': 'Update type is required'
            }),
        // Status update specific fields
        previousStatus: Joi.string()
            .valid(...Object.values(CaseStatus))
            .when('updateType', {
                is: Joi.string().valid(UpdateType.STATUS_UPDATE),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'any.only': `Previous status must be one of: ${Object.values(CaseStatus).join(', ')}`,
                'any.required': 'Previous status is required for status updates'
            }),
        newStatus: Joi.string()
            .valid(...Object.values(CaseStatus))
            .when('updateType', {
                is: Joi.string().valid(UpdateType.STATUS_UPDATE),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'any.only': `New status must be one of: ${Object.values(CaseStatus).join(', ')}`,
                'any.required': 'New status is required for status updates'
            }),
        // Common fields visible to all update types
        visibility: Joi.string()
            .valid(...Object.values(Visibility))
            .default(Visibility.INTERNAL)
            .optional()
            .messages({
                'any.only': `Visibility must be one of: ${Object.values(Visibility).join(', ')}`
            }),
        remarks: Joi.string()
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Remarks cannot exceed 1000 characters'
            }),
        // Note specific fields
        note: Joi.string()
            .min(5)
            .max(2000)
            .when('updateType', {
                is: Joi.string().valid(UpdateType.NOTE),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'string.min': 'Note must be at least 5 characters',
                'string.max': 'Note cannot exceed 2000 characters',
                'any.required': 'Note is required for note updates'
            }),
        // Statement specific fields
        statement: Joi.object({
            personName: Joi.string()
                .min(2)
                .max(200)
                .trim()
                .when('updateType', {
                    is: Joi.string().valid(UpdateType.STATEMENT),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional()
                })
                .messages({
                    'string.min': 'Person name must be at least 2 characters',
                    'string.max': 'Person name cannot exceed 200 characters',
                    'any.required': 'Person name is required for statements'
                }),
            statementText: Joi.string()
                .min(10)
                .max(5000)
                .when('updateType', {
                    is: Joi.string().valid(UpdateType.STATEMENT),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional()
                })
                .messages({
                    'string.min': 'Statement must be at least 10 characters',
                    'string.max': 'Statement cannot exceed 5000 characters',
                    'any.required': 'Statement text is required for statements'
                })
        })
            .when('updateType', {
                is: Joi.string().valid(UpdateType.STATEMENT),
                then: Joi.object().required(),
                otherwise: Joi.object().optional()
            })
            .messages({
                'any.required': 'Statement details are required for statement updates'
            }),
        // Arrest specific fields
        arrest: Joi.object({
            suspectName: Joi.string()
                .min(2)
                .max(200)
                .trim()
                .when('updateType', {
                    is: Joi.string().valid(UpdateType.ARREST),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional()
                })
                .messages({
                    'string.min': 'Suspect name must be at least 2 characters',
                    'string.max': 'Suspect name cannot exceed 200 characters',
                    'any.required': 'Suspect name is required for arrests'
                }),
            details: Joi.string()
                .min(10)
                .max(5000)
                .when('updateType', {
                    is: Joi.string().valid(UpdateType.ARREST),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional()
                })
                .messages({
                    'string.min': 'Arrest details must be at least 10 characters',
                    'string.max': 'Arrest details cannot exceed 5000 characters',
                    'any.required': 'Arrest details are required for arrests'
                }),
            arrestDate: Joi.date()
                .max('now')
                .when('updateType', {
                    is: Joi.string().valid(UpdateType.ARREST),
                    then: Joi.date().required(),
                    otherwise: Joi.date().optional()
                })
                .messages({
                    'date.max': 'Arrest date cannot be in the future',
                    'any.required': '_arrest date is required for arrests'
                })
        })
            .when('updateType', {
                is: Joi.string().valid(UpdateType.ARREST),
                then: Joi.object().required(),
                otherwise: Joi.object().optional()
            })
            .messages({
                'any.required': 'Arrest details are required for arrest updates'
            }),
        // Evidence files (array of evidence IDs)
        evidenceFiles: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .when('updateType', {
                is: Joi.string().valid(UpdateType.EVIDENCE),
                then: Joi.array().min(1).required(),
                otherwise: Joi.array().optional()
            })
            .messages({
                'array.min': 'At least one evidence file is required for evidence updates',
                'any.required': 'Evidence files are required for evidence updates',
                'string.pattern.base': 'Invalid evidence ID format'
            })
    })
};

// ─────────────── GET CASE UPDATES ───────────────
export const getCaseUpdatesSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    query: Joi.object({
        updateType: Joi.string()
            .valid(...Object.values(UpdateType))
            .optional()
            .messages({
                'any.only': `Update type must be one of: ${Object.values(UpdateType).join(', ')}`
            }),
        visibility: Joi.string()
            .valid(...Object.values(Visibility))
            .optional()
            .messages({
                'any.only': `Visibility must be one of: ${Object.values(Visibility).join(', ')}`
            }),
        ...paginationSchema
    })
};

// ─────────────── UPDATE CASE UPDATE (Edit) ───────────────
export const updateCaseUpdateSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema,
        updateId: requiredMongoIdSchema
    }),
    body: Joi.object({
        remarks: Joi.string()
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Remarks cannot exceed 1000 characters'
            }),
        note: Joi.string()
            .min(5)
            .max(2000)
            .optional()
            .messages({
                'string.min': 'Note must be at least 5 characters',
                'string.max': 'Note cannot exceed 2000 characters'
            }),
        visibility: Joi.string()
            .valid(...Object.values(Visibility))
            .optional()
            .messages({
                'any.only': `Visibility must be one of: ${Object.values(Visibility).join(', ')}`
            })
    })
};
