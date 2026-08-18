import Joi from 'joi';
import {
    TenantType
} from './common.schema.js';

// ─────────────── CREATE TENANT (SuperAdmin only) ───────────────
export const createTenantSchema = {
    body: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .required()
            .messages({
                'string.min': 'Tenant name must be at least 2 characters',
                'string.max': 'Tenant name cannot exceed 100 characters',
                'any.required': 'Tenant name is required'
            }),
        region: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .required()
            .messages({
                'string.min': 'Region must be at least 2 characters',
                'string.max': 'Region cannot exceed 100 characters',
                'any.required': 'Region is required'
            }),
        type: Joi.string()
            .valid(...Object.values(TenantType))
            .required()
            .messages({
                'any.only': `Type must be one of: ${Object.values(TenantType).join(', ')}`,
                'any.required': 'Tenant type is required'
            })
    })
};

// ─────────────── GET TENANT DETAILS ───────────────
export const getTenantDetailsSchema = {
    params: Joi.object({
        tenantId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid tenant ID format',
                'any.required': 'Tenant ID is required'
            })
    })
};

// ─────────────── UPDATE TENANT ───────────────
export const updateTenantSchema = {
    params: Joi.object({
        tenantId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Invalid tenant ID format',
                'any.required': 'Tenant ID is required'
            })
    }),
    body: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.min': 'Tenant name must be at least 2 characters',
                'string.max': 'Tenant name cannot exceed 100 characters'
            }),
        region: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.min': 'Region must be at least 2 characters',
                'string.max': 'Region cannot exceed 100 characters'
            }),
        isActive: Joi.boolean()
            .optional()
    })
};

// ─────────────── GET ALL TENANTS ───────────────
export const getAllTenantsSchema = {
    query: Joi.object({
        type: Joi.string()
            .valid(...Object.values(TenantType))
            .optional()
            .messages({
                'any.only': `Type must be one of: ${Object.values(TenantType).join(', ')}`
            }),
        isActive: Joi.boolean()
            .optional(),
        region: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'Region cannot exceed 100 characters'
            })
    })
};
