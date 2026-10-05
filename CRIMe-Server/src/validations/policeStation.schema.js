import Joi from 'joi';
import {
    requiredLocationSchema,
    requiredMongoIdSchema,
    optionalMongoIdSchema,
    paginationSchema,
    phonePattern
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
        location: requiredLocationSchema,
        locationLabel: Joi.string()
            .max(500)
            .required()
            .messages({
                'string.max': 'Location label cannot exceed 500 characters',
                'any.required': 'Location label is required'
            }),
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
            .pattern(phonePattern)
            .required()
            .messages({
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
        search: Joi.string()
            .max(100)
            .trim()
            .optional()
            .messages({
                'string.max': 'Search term cannot exceed 100 characters'
            }),
        ...paginationSchema(10)
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
