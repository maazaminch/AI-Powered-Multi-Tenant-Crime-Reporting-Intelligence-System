import Joi from 'joi';
import {
    requiredUserBaseFields,
    userBaseFields,
    requiredPasswordSchema,
    requiredEmailSchema,
    requiredPhoneSchema,
    Roles,
    Gender,
    IdType,
    minAgeValidator,
    requiredAddressSchema
} from './common.schema.js';

// ─────────────── REGISTER CITIZEN ───────────────
export const registerCitizenSchema = {
    body: Joi.object({
        ...requiredUserBaseFields,
        address: requiredAddressSchema,
        profilePictureUrl: Joi.string()
            .uri()
            .max(2048)
            .allow('')
            .optional(),
        profilePicturePublicId: Joi.string()
            .max(500)
            .allow('')
            .optional(),
        password: requiredPasswordSchema,
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Passwords do not match',
                'any.required': 'Please confirm your password'
            })
    })
};

// ─────────────── REGISTER WITH INVITE (Admin/Police) ───────────────
export const registerWithInviteSchema = {
    body: Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'any.required': 'Invite token is required'
            }),
        ...requiredUserBaseFields,
        address: requiredAddressSchema,
        profilePictureUrl: Joi.string()
            .uri()
            .max(2048)
            .allow('')
            .optional(),
        profilePicturePublicId: Joi.string()
            .max(500)
            .allow('')
            .optional(),
        password: requiredPasswordSchema,
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'any.only': 'Passwords do not match',
                'any.required': 'Please confirm your password'
            }),
        // Police-specific fields
        badgeNumber: Joi.string()
            .when('role', {
                is: Joi.string().valid(Roles.POLICE).required(),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'any.required': 'Badge number is required for police officers'
            }),
    })
};

// ─────────────── LOGIN ───────────────
export const loginSchema = {
    body: Joi.object({
        email: requiredEmailSchema,
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'Password is required'
            })
    })
};

// ─────────────── GOOGLE LOGIN ───────────────
export const googleLoginSchema = {
    body: Joi.object({
        idToken: Joi.string()
            .required()
            .messages({
                'any.required': 'Google ID token is required'
            })
    })
};

// ─────────────── GOOGLE REGISTER CITIZEN ───────────────
export const googleRegisterCitizenSchema = {
    body: Joi.object({

        idToken: Joi.string()
            .required()
            .messages({
                'any.required': 'Google ID token is required'
            }),

        phone: requiredPhoneSchema,

        gender: userBaseFields.gender
            .required()
            .messages({
                'any.required': 'Gender is required'
            }),

        dateOfBirth: userBaseFields.dateOfBirth
            .required()
            .custom(minAgeValidator(15))
            .messages({
                'any.required': 'Date of birth is required',
                'any.invalid': 'You must be at least 15 years old to register'
            }),

        address: requiredAddressSchema,

        idType: userBaseFields.idType
            .required()
            .messages({
                'any.required': 'ID type is required'
            }),

        nationalIdHash: userBaseFields.nationalIdHash
            .required()
            .messages({
                'any.required': 'National ID is required'
            }),

        profilePictureUrl: Joi.string()
            .uri()
            .max(2048)
            .allow('')
            .optional(),

        profilePicturePublicId: Joi.string()
            .max(500)
            .allow('')
            .optional()
    })
};



// ─────────────── REFRESH TOKEN ───────────────
export const refreshTokenSchema = {
    body: Joi.object({
        refreshToken: Joi.string()
            .required()
            .messages({
                'any.required': 'Refresh token is required'
            })
    })
};

// ─────────────── REVOKE TOKEN ───────────────
export const revokeTokenSchema = {
    body: Joi.object({
        refreshToken: Joi.string()
            .required()
            .messages({
                'any.required': 'Refresh token is required'
            })
    })
};
