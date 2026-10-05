import Joi from 'joi';
import { coordinatesValidator } from './common.schema.js';

// Location Validation Schemas

/**
 * Schema for reverse geocoding request
 * Converts coordinates to address
 */
export const reverseGeocodeSchema = {
    body: Joi.object({
        latitude: Joi.number()
            .min(-90)
            .max(90)
            .required()
            .messages({
                'number.min': 'Latitude must be between -90 and 90',
                'number.max': 'Latitude must be between -90 and 90',
                'any.required': 'Latitude is required'
            }),
        longitude: Joi.number()
            .min(-180)
            .max(180)
            .required()
            .messages({
                'number.min': 'Longitude must be between -180 and 180',
                'number.max': 'Longitude must be between -180 and 180',
                'any.required': 'Longitude is required'
            })
    })
};

/**
 * Schema for nearby stations query
 * Finds police stations near a location
 */
export const nearbyStationsSchema = {
    query: Joi.object({
        latitude: Joi.number()
            .min(-90)
            .max(90)
            .required()
            .messages({
                'number.min': 'Latitude must be between -90 and 90',
                'number.max': 'Latitude must be between -90 and 90',
                'any.required': 'Latitude is required'
            }),
        longitude: Joi.number()
            .min(-180)
            .max(180)
            .required()
            .messages({
                'number.min': 'Longitude must be between -180 and 180',
                'number.max': 'Longitude must be between -180 and 180',
                'any.required': 'Longitude is required'
            }),
        radius: Joi.number()
            .min(1)
            .max(100)
            .default(10)
            .optional()
            .messages({
                'number.min': 'Radius must be at least 1 km',
                'number.max': 'Radius cannot exceed 100 km'
            })
    })
};


/**
 * Schema for location validation
 * Validates a complete location object
 */
export const validateLocationSchema = {
    body: Joi.object({
        location: Joi.object({
            type: Joi.string()
                .valid('Point')
                .required()
                .messages({
                    'any.only': 'Location type must be Point',
                    'any.required': 'Location type is required'
                }),
            coordinates: Joi.array()
                .length(2)
                .items(Joi.number().required())
                .required()
                .custom(coordinatesValidator)
                .messages({
                    'array.length': 'Coordinates must have exactly 2 values [longitude, latitude]',
                    'any.invalid': 'Invalid coordinate values'
                })
        }).required()
            .messages({
                'any.required': 'Location is required'
            }),
        locationLabel: Joi.string()
            .max(500)
            .optional()
            .messages({
                'string.max': 'Location label cannot exceed 500 characters'
            }),
        address: Joi.string()
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Address cannot exceed 1000 characters'
            })
    })
};

/**
 * Schema for distance calculation
 */
export const distanceCalculationSchema = {
    body: Joi.object({
        origin: Joi.object({
            latitude: Joi.number()
                .min(-90)
                .max(90)
                .required()
                .messages({
                    'number.min': 'Origin latitude must be between -90 and 90',
                    'number.max': 'Origin latitude must be between -90 and 90',
                    'any.required': 'Origin latitude is required'
                }),
            longitude: Joi.number()
                .min(-180)
                .max(180)
                .required()
                .messages({
                    'number.min': 'Origin longitude must be between -180 and 180',
                    'number.max': 'Origin longitude must be between -180 and 180',
                    'any.required': 'Origin longitude is required'
                })
        }).required()
            .messages({
                'any.required': 'Origin coordinates are required'
            }),
        destination: Joi.object({
            latitude: Joi.number()
                .min(-90)
                .max(90)
                .required()
                .messages({
                    'number.min': 'Destination latitude must be between -90 and 90',
                    'number.max': 'Destination latitude must be between -90 and 90',
                    'any.required': 'Destination latitude is required'
                }),
            longitude: Joi.number()
                .min(-180)
                .max(180)
                .required()
                .messages({
                    'number.min': 'Destination longitude must be between -180 and 180',
                    'number.max': 'Destination longitude must be between -180 and 180',
                    'any.required': 'Destination longitude is required'
                })
        }).required()
            .messages({
                'any.required': 'Destination coordinates are required'
            })
    })
};

/**
 * Schema for jurisdiction check
 */
export const jurisdictionCheckSchema = {
    query: Joi.object({
        latitude: Joi.number()
            .min(-90)
            .max(90)
            .required()
            .messages({
                'number.min': 'Latitude must be between -90 and 90',
                'number.max': 'Latitude must be between -90 and 90',
                'any.required': 'Latitude is required'
            }),
        longitude: Joi.number()
            .min(-180)
            .max(180)
            .required()
            .messages({
                'number.min': 'Longitude must be between -180 and 180',
                'number.max': 'Longitude must be between -180 and 180',
                'any.required': 'Longitude is required'
            }),
        stationId: Joi.string()
            .optional()
            .messages({
                'string.base': 'Station ID must be a string'
            })
    })
};

/**
 * Schema for tenant stations query
 * Gets all stations for a tenant
 */
export const tenantStationsSchema = {
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

/**
 * Schema for address search
 * Searches for addresses using geocoding API
 */
export const searchAddressSchema = {
    query: Joi.object({
        query: Joi.string()
            .min(3)
            .max(200)
            .trim()
            .required()
            .messages({
                'string.min': 'Search query must be at least 3 characters',
                'string.max': 'Search query cannot exceed 200 characters',
                'any.required': 'Search query is required'
            })
    })
};
