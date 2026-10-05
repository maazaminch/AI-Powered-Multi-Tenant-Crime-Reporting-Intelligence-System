import Joi from 'joi';
import {
    requiredMongoIdSchema,
    optionalMongoIdSchema,
    UpdateType,
    Visibility,
    paginationSchema
} from './common.schema.js';

// ─────────────── ADD CASE UPDATE (Police) ───────────────
export const addCaseUpdateSchema = {
    params: Joi.object({
        caseId: requiredMongoIdSchema
    }),
    body: Joi.object({
        updateType: Joi.string()
            .valid(UpdateType.NOTE, UpdateType.EVIDENCE, UpdateType.STATEMENT, UpdateType.ARREST)
            .required()
            .messages({
                'any.only': 'Update type must be NOTE, EVIDENCE, STATEMENT, or ARREST',
                'any.required': 'Update type is required'
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
            .trim()
            .min(1)
            .max(2000)
            .when('updateType', {
                is: Joi.string().valid(UpdateType.NOTE),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'string.min': 'Note is required',
                'string.max': 'Note cannot exceed 2000 characters',
                'any.required': 'Note is required for note updates'
            }),
        // Statement specific fields
        statement: Joi.object({
            personName: Joi.string()
                .max(200)
                .trim()
                .allow('')
                .optional()
                .messages({
                    'string.max': 'Person name cannot exceed 200 characters'
                }),
            text: Joi.string()
                .trim()
                .min(1)
                .max(5000)
                .when('updateType', {
                    is: Joi.string().valid(UpdateType.STATEMENT),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional()
                })
                .messages({
                    'string.min': 'Statement text is required',
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
            personName: Joi.string()
                .trim()
                .min(1)
                .max(200)
                .when('updateType', {
                    is: Joi.string().valid(UpdateType.ARREST),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional()
                })
                .messages({
                    'string.min': 'Suspect name is required',
                    'string.max': 'Suspect name cannot exceed 200 characters',
                    'any.required': 'Suspect name is required for arrests'
                }),
            personContact: Joi.string()
                .max(20)
                .trim()
                .allow('')
                .optional()
                .messages({
                    'string.max': 'Contact number cannot exceed 20 characters'
                }),
            arrestReason: Joi.string()
                .trim()
                .min(1)
                .max(5000)
                .when('updateType', {
                    is: Joi.string().valid(UpdateType.ARREST),
                    then: Joi.string().required(),
                    otherwise: Joi.string().optional()
                })
                .messages({
                    'string.min': 'Arrest reason is required',
                    'string.max': 'Arrest details cannot exceed 5000 characters',
                    'any.required': 'Arrest details are required for arrests'
                }),
            arrestDate: Joi.date()
                .max('now')
                .allow('')
                .optional()
                .messages({
                    'date.max': 'Arrest date cannot be in the future'
                }),
            arrestLocation: Joi.string()
                .max(200)
                .trim()
                .allow('')
                .optional()
                .messages({
                    'string.max': 'Arrest location cannot exceed 200 characters'
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
            .items(optionalMongoIdSchema)
            .when('updateType', {
                is: Joi.string().valid(UpdateType.EVIDENCE),
                then: Joi.array().min(1).required(),
                otherwise: Joi.array().optional()
            })
            .messages({
                'array.min': 'At least one evidence file is required for evidence updates',
                'any.required': 'Evidence files are required for evidence updates'
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
        ...paginationSchema(10)
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
