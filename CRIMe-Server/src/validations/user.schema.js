import Joi from 'joi';
import {
    requiredMongoIdSchema,
    UserStatus,
    Roles,
    paginationSchema
} from './common.schema.js';

// ─────────────── UPDATE USER STATUS ───────────────
export const updateUserStatusSchema = {
    params: Joi.object({
        userId: requiredMongoIdSchema
    }),
    body: Joi.object({
        status: Joi.string()
            .valid(...Object.values(UserStatus))
            .required()
            .messages({
                'any.only': `Status must be one of: ${Object.values(UserStatus).join(', ')}`,
                'any.required': 'Status is required'
            })
    })
};

// ─────────────── SEARCH USERS ───────────────
export const searchUsersSchema = {
    query: Joi.object({
        search: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.min': 'Search term must be at least 2 characters',
                'string.max': 'Search term cannot exceed 100 characters'
            }),
        role: Joi.string()
            .valid(...Object.values(Roles))
            .optional()
            .messages({
                'any.only': `Role must be one of: ${Object.values(Roles).join(', ')}`
            }),
        status: Joi.string()
            .valid(...Object.values(UserStatus))
            .optional()
            .messages({
                'any.only': `Status must be one of: ${Object.values(UserStatus).join(', ')}`
            }),
        policeStationId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid police station ID format'
            }),
        isStationHead: Joi.boolean()
            .optional(),
        ...paginationSchema
    })
};

// ─────────────── DELETE USER ───────────────
export const deleteUserSchema = {
    params: Joi.object({
        id: requiredMongoIdSchema
    })
};

// ─────────────── ASSIGN POLICE TO STATION ───────────────
export const assignPoliceToStationSchema = {
    params: Joi.object({
        policeId: requiredMongoIdSchema
    }),
    body: Joi.object({
        policeStationId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid police station ID format',
                'any.required': 'Police station ID is required'
            })
    })
};

// ─────────────── TRANSFER POLICE ───────────────
export const transferPoliceSchema = {
    params: Joi.object({
        policeId: requiredMongoIdSchema
    }),
    body: Joi.object({
        fromStationId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid source station ID format',
                'any.required': 'Source station ID is required'
            }),
        toStationId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid destination station ID format',
                'any.required': 'Destination station ID is required'
            })
    })
};

// ─────────────── ASSIGN OR CHANGE STATION HEAD ───────────────
export const assignOrChangeStationHeadSchema = {
    params: Joi.object({
        stationId: requiredMongoIdSchema
    }),
    body: Joi.object({
        stationHeadId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid user ID format',
                'any.required': 'Station head ID is required'
            })
    })
};

// ─────────────── REMOVE STATION HEAD ───────────────
export const removeStationHeadSchema = {
    params: Joi.object({
        stationId: requiredMongoIdSchema
    })
};
