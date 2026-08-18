import Joi from 'joi';
import {
    requiredFullLocationSchema,
    requiredMongoIdSchema,
    optionalMongoIdSchema,
    paginationSchema
} from './common.schema.js';

// ─────────────── CREATE STATION ───────────────
export const createStationSchema = {
    body: Joi.object({
        name: Joi.string()
            .min(3)
            .max(200)
            .trim()
            .required()
            .messages({
                'string.min': 'Station name must be at least 3 characters',
                'string.max': 'Station name cannot exceed 200 characters',
                'any.required': 'Station name is required'
            }),
        location: requiredFullLocationSchema.location,
        locationLabel: requiredFullLocationSchema.locationLabel,
        address: Joi.string()
            .max(500)
            .trim()
            .optional()
            .messages({
                'string.max': 'Address cannot exceed 500 characters'
            }),
        city: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .required()
            .messages({
                'string.min': 'City must be at least 2 characters',
                'string.max': 'City cannot exceed 100 characters',
                'any.required': 'City is required'
            }),
        sector: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'Sector cannot exceed 100 characters'
            }),
        contactNumber: Joi.string()
            .min(10)
            .max(15)
            .pattern(/^\d{10,15}$/)
            .required()
            .messages({
                'string.min': 'Contact number must be at least 10 characters',
                'string.max': 'Contact number cannot exceed 15 characters',
                'string.pattern.base': 'Please provide a valid contact number',
                'any.required': 'Contact number is required'
            }),
        email: Joi.string()
            .email()
            .lowercase()
            .trim()
            .optional()
            .messages({
                'string.email': 'Please provide a valid email address'
            })
    })
};

// ─────────────── DELETE STATION ───────────────
export const deleteStationSchema = {
    params: Joi.object({
        stationId: requiredMongoIdSchema
    })
};

// ─────────────── ACTIVATE OR DEACTIVATE STATION ───────────────
export const activateOrDeactivateStationSchema = {
    params: Joi.object({
        stationId: requiredMongoIdSchema
    }),
    body: Joi.object({
        isActive: Joi.boolean()
            .required()
            .messages({
                'any.required': 'Status (isActive) is required'
            })
    })
};

// ─────────────── GET STATIONS ───────────────
export const getStationsSchema = {
    query: Joi.object({
        city: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'City cannot exceed 100 characters'
            }),
        sector: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'Sector cannot exceed 100 characters'
            }),
        isActive: Joi.boolean()
            .optional(),
        ...paginationSchema
    })
};

// ─────────────── GET STATION DETAILS ───────────────
export const getStationDetailsSchema = {
    params: Joi.object({
        stationId: requiredMongoIdSchema
    })
};

// ─────────────── STATIONS DROPDOWN ───────────────
export const stationsDropdownSchema = {
    query: Joi.object({
        city: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'City cannot exceed 100 characters'
            }),
        isActive: Joi.boolean()
            .optional()
    })
};
