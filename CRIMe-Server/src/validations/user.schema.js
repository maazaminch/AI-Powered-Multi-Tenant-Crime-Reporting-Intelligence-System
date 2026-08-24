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

// ─────────────── UPDATE PROFILE ───────────────
export const updateProfileSchema = {
    body: Joi.object({
        fullName: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .allow('')
            .optional()
            .messages({
                'string.min': 'Full name must be at least 2 characters',
                'string.max': 'Full name cannot exceed 100 characters'
            }),
        email: Joi.string()
            .email()
            .lowercase()
            .trim()
            .allow('')
            .optional()
            .messages({
                'string.email': 'Invalid email format'
            }),
        profilePictureUrl: Joi.string()
            .uri()
            .allow('')
            .optional()
            .messages({
                'string.uri': 'Profile picture must be a valid URL'
            }),
        gender: Joi.string()
            .valid('MALE', 'FEMALE')
            .allow('')
            .optional()
            .messages({
                'any.only': 'Gender must be either MALE or FEMALE'
            }),
        dateOfBirth: Joi.date()
            .max('now')
            .allow('')
            .optional()
            .messages({
                'date.max': 'Date of birth cannot be in the future'
            }),
        address: Joi.string()
            .max(500)
            .trim()
            .allow('')
            .optional()
            .messages({
                'string.max': 'Address cannot exceed 500 characters'
            })
    })
};

// ─────────────── CHANGE PASSWORD ───────────────
export const changePasswordSchema = {
    body: Joi.object({
        currentPassword: Joi.string()
            .required()
            .messages({
                'any.required': 'Current password is required'
            }),
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .required()
            .messages({
                'any.required': 'New password is required',
                'string.min': 'New password must be at least 8 characters',
                'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('newPassword'))
            .required()
            .messages({
                'any.only': 'Confirm password must match new password',
                'any.required': 'Please confirm your new password'
            })
    })
};
