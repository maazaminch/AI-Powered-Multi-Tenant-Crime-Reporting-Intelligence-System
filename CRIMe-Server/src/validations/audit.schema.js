// validations/audit.schema.js
import Joi from "joi";
import { mongoIdSchema, paginationSchema } from "./common.schema.js";

export const getAuditLogsSchema = {
  query: Joi.object({
    ...paginationSchema(20),
    tenantId: mongoIdSchema.optional().messages({
      'string.pattern.base': 'Invalid tenant ID format'
    }),
    userId: mongoIdSchema.optional().messages({
      'string.pattern.base': 'Invalid user ID format'
    }),
    action: Joi.string().max(50).trim().optional().messages({
      'string.max': 'Action cannot exceed 50 characters'
    }),
    targetType: Joi.string().max(50).trim().optional().messages({
      'string.max': 'Target type cannot exceed 50 characters'
    }),
    sensitivity: Joi.string()
      .valid('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')
      .optional()
      .messages({
        'any.only': 'Sensitivity must be PUBLIC, INTERNAL, CONFIDENTIAL, or RESTRICTED'
      }),
    search: Joi.string().max(100).trim().optional().messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
    startDate: Joi.string().isoDate().strict().optional().messages({
      'string.isoDate': 'Start date must be a valid date'
    }),
    endDate: Joi.string().isoDate().strict().optional().messages({
      'string.isoDate': 'End date must be a valid date'
    }),
  }),
};