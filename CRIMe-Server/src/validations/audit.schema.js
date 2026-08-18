import Joi from 'joi';
import { paginationSchema, mongoIdSchema } from './common.schema.js';

// Audit log filters schema
export const auditLogFiltersSchema = {
  tenantId: mongoIdSchema.optional(),
  action: Joi.string()
    .valid('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD', 'VIEW')
    .optional()
    .messages({
      'any.only': 'Invalid action type'
    }),
  targetType: Joi.string()
    .valid('CASE', 'CASE_UPDATE', 'EVIDENCE', 'USER', 'TENANT', 'POLICE_STATION', 'NOTIFICATION', 'ROLE_PERMISSION', 'AUTH', 'PROFILE', 'STATION_ASSIGNMENT')
    .optional()
    .messages({
      'any.only': 'Invalid target type'
    }),
  userId: mongoIdSchema.optional(),
  severity: Joi.string()
    .valid('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')
    .optional()
    .messages({
      'any.only': 'Invalid sensitivity level'
    }),
  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Invalid start date format'
    }),
  endDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Invalid end date format'
    }),
  ...paginationSchema
};

// Get audit logs query validation
export const getAuditLogsSchema = Joi.object({
  ...auditLogFiltersSchema
});

// Get audit log by ID params validation
export const getAuditLogByIdSchema = Joi.object({
  id: mongoIdSchema.required().messages({
    'any.required': 'Audit log ID is required'
  })
});

// Get user activity params validation
export const getUserActivitySchema = Joi.object({
  userId: mongoIdSchema.required().messages({
    'any.required': 'User ID is required'
  })
});

// Get user activity query validation
export const getUserActivityQuerySchema = Joi.object({
  ...paginationSchema
});