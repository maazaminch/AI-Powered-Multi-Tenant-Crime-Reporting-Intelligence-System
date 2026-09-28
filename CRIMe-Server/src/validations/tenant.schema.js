import Joi from "joi";
import { mongoIdSchema, paginationSchema, TenantType } from "./common.schema.js";

export const getAllTenantsSchema = {
  query: Joi.object({
    search: Joi.string().trim().max(100).optional().messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
    type: Joi.string().valid(...Object.values(TenantType)).optional().messages({
      'any.only': `Type must be one of: ${Object.values(TenantType).join(', ')}`
    }),
    isActive: Joi.boolean().optional(),
    ...paginationSchema(10),
  }),
};

export const tenantIdParamsSchema = {
  params: Joi.object({
    tenantId: mongoIdSchema.required().messages({
      'string.pattern.base': 'Invalid tenant ID format',
      'any.required': 'Tenant ID is required'
    }),
  }),
};

export const createTenantSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    region: Joi.string().trim().min(2).max(100).required().messages({
      'string.min': 'Region must be at least 2 characters',
      'string.max': 'Region cannot exceed 100 characters',
      'any.required': 'Region is required'
    }),
    type: Joi.string().valid(...Object.values(TenantType)).required().messages({
      'any.only': `Type must be one of: ${Object.values(TenantType).join(', ')}`,
      'any.required': 'Type is required'
    }),
  }),
};