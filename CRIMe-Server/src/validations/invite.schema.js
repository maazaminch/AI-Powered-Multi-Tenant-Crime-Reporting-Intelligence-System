import Joi from 'joi';
import {
    requiredEmailSchema,
    Roles,
    mongoIdSchema
} from './common.schema.js';

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
        tenantId: mongoIdSchema
            .when('role', {
                is: Joi.string().valid(Roles.POLICE),
                then: mongoIdSchema.required(),
                otherwise: mongoIdSchema.optional()
            })
            .messages({
                'string.pattern.base': 'Invalid tenant ID format',
                'any.required': 'Tenant ID is required for police invitations'
            })
    })
};

// ─────────────── VALIDATE INVITE TOKEN ───────────────
export const validateInviteTokenSchema = {
    body: Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'any.required': 'Invite token is required'
            })
    })
};

// ─────────────── GET INVITE DETAILS ───────────────
export const getInviteDetailsSchema = {
    params: Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'any.required': 'Invite token is required'
            })
    })
};
