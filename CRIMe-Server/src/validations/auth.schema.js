import Joi from 'joi';
import {
    requiredUserBaseFields,
    requiredPasswordSchema,
    requiredEmailSchema,
    requiredPhoneSchema,
    Roles,
    Gender,
    IdType,
    minAgeValidator
} from './common.schema.js';

// ─────────────── REGISTER CITIZEN ───────────────
export const registerCitizenSchema = {
    body: Joi.object({
        ...requiredUserBaseFields,
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
                is: Joi.string().valid(Roles.POLICE),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'any.required': 'Badge number is required for police officers'
            }),
        policeStationId: Joi.string()
            .when('role', {
                is: Joi.string().valid(Roles.POLICE),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'any.required': 'Police station assignment is required for police officers'
            })
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
        googleId: Joi.string()
            .required()
            .messages({
                'any.required': 'Google ID is required'
            }),
        ...requiredUserBaseFields,
        profilePictureUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Profile picture must be a valid URL'
            })
    })
};

// ─────────────── CREATE INVITE LINK ───────────────
export const createInviteLinkSchema = {
    body: Joi.object({
        email: requiredEmailSchema,
        role: Joi.string()
            .valid(Roles.ADMIN, Roles.POLICE)
            .required()
            .messages({
                'any.only': 'Role must be either ADMIN or POLICE',
                'any.required': 'Role is required'
            }),
        tenantId: Joi.string()
            .when('role', {
                is: Joi.string().valid(Roles.POLICE),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'any.required': 'Tenant ID is required for police invitations'
            }),
        stationId: Joi.string()
            .when('role', {
                is: Joi.string().valid(Roles.POLICE),
                then: Joi.string().required(),
                otherwise: Joi.string().optional()
            })
            .messages({
                'any.required': 'Station ID is required for police invitations'
            })
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
