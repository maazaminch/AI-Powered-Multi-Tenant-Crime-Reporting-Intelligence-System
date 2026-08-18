import Joi from 'joi';

// ─────────────── PATTERNS ───────────────

// Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
export const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Phone: 10-15 characters
export const phonePattern = /^\d{10,15}$/;

// MongoDB ObjectId
export const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

// ─────────────── ENUMS ───────────────

export const Roles = {
    CITIZEN: 'CITIZEN',
    POLICE: 'POLICE',
    ADMIN: 'ADMIN'
};

export const UserStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    BLOCKED: 'BLOCKED',
    REJECTED: 'REJECTED'
};

export const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE'
};

export const IdType = {
    PASSPORT: 'PASSPORT',
    DRIVER_LICENSE: 'DRIVER_LICENSE',
    NATIONAL_ID: 'NATIONAL_ID'
};

export const AuthProvider = {
    LOCAL: 'LOCAL',
    GOOGLE: 'GOOGLE'
};

export const CaseStatus = {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    UNDER_INVESTIGATION: 'UNDER_INVESTIGATION',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED'
};

export const CrimeType = {
    THEFT: 'THEFT',
    ROBBERY: 'ROBBERY',
    ASSAULT: 'ASSAULT',
    MURDER: 'MURDER',
    DOMESTIC_VIOLENCE: 'DOMESTIC_VIOLENCE',
    CYBER_CRIME: 'CYBER_CRIME',
    KIDNAPPING: 'KIDNAPPING',
    FRAUD: 'FRAUD',
    DRUG_OFFENSE: 'DRUG_OFFENSE',
    HARASSMENT: 'HARASSMENT',
    TRAFFIC_VIOLATION: 'TRAFFIC_VIOLATION',
    OTHER: 'OTHER'
};

export const Severity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

export const FileType = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    AUDIO: 'AUDIO',
    PDF: 'PDF',
    DOCUMENT: 'DOCUMENT'
};

export const UpdateType = {
    STATUS_UPDATE: 'STATUS_UPDATE',
    NOTE: 'NOTE',
    EVIDENCE: 'EVIDENCE',
    STATEMENT: 'STATEMENT',
    ARREST: 'ARREST'
};

export const Visibility = {
    PUBLIC: 'PUBLIC',
    INTERNAL: 'INTERNAL'
};

export const TenantType = {
    CITY: 'CITY',
    DEPARTMENT: 'DEPARTMENT'
};

// ─────────────── BASIC FIELD SCHEMAS ───────────────

export const emailSchema = Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
        'string.email': 'Please provide a valid email address'
    });

export const requiredEmailSchema = emailSchema.required().messages({
    'any.required': 'Email is required'
});

export const phoneSchema = Joi.string()
    .min(10)
    .max(15)
    .pattern(phonePattern)
    .messages({
        'string.min': 'Phone number must be at least 10 characters',
        'string.max': 'Phone number cannot exceed 15 characters',
        'string.pattern.base': 'Please provide a valid phone number'
    });

export const requiredPhoneSchema = phoneSchema.required().messages({
    'any.required': 'Phone number is required'
});

export const passwordSchema = Joi.string()
    .pattern(passwordPattern)
    .messages({
        'string.pattern.base': 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)'
    });

export const requiredPasswordSchema = passwordSchema.required().messages({
    'any.required': 'Password is required'
});

export const mongoIdSchema = Joi.string()
    .pattern(mongoIdPattern)
    .messages({
        'string.pattern.base': 'Invalid ID format'
    });

export const requiredMongoIdSchema = mongoIdSchema.required().messages({
    'any.required': 'ID is required'
});

export const optionalMongoIdSchema = mongoIdSchema.optional();

// ─────────────── CUSTOM VALIDATORS ───────────────

// Age validation - minimum age
export const minAgeValidator = (minAge) => {
    return (value, helpers) => {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < minAge) {
            return helpers.error('any.invalid');
        }
        return value;
    };
};

// GeoJSON coordinates validation
export const coordinatesValidator = (value, helpers) => {
    const [lng, lat] = value;
    if (lat < -90 || lat > 90) {
        return helpers.error('any.invalid');
    }
    if (lng < -180 || lng > 180) {
        return helpers.error('any.invalid');
    }
    return value;
};

// ─────────────── COMPOUND SCHEMAS ───────────────

// User base fields (common across registration/update)
export const userBaseFields = {
    fullName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .messages({
            'string.min': 'Full name must be at least 2 characters',
            'string.max': 'Full name cannot exceed 100 characters'
        }),
    email: emailSchema,
    phone: phoneSchema,
    gender: Joi.string()
        .valid(...Object.values(Gender))
        .messages({
            'any.only': 'Gender must be either MALE or FEMALE'
        }),
    dateOfBirth: Joi.date()
        .max('now')
        .messages({
            'date.max': 'Date of birth cannot be in the future'
        }),
    idType: Joi.string()
        .valid(...Object.values(IdType))
        .messages({
            'any.only': 'ID type must be PASSPORT, DRIVER_LICENSE, or NATIONAL_ID'
        }),
    nationalIdHash: Joi.string()
        .min(5)
        .max(30)
        .messages({
            'string.min': 'National ID must be at least 5 characters',
            'string.max': 'National ID cannot exceed 30 characters'
        })
};

// Required user base fields
export const requiredUserBaseFields = {
    fullName: userBaseFields.fullName.required().messages({
        'any.required': 'Full name is required'
    }),
    email: requiredEmailSchema,
    phone: requiredPhoneSchema,
    gender: userBaseFields.gender.required().messages({
        'any.required': 'Gender is required'
    }),
    dateOfBirth: userBaseFields.dateOfBirth
        .required()
        .custom(minAgeValidator(15))
        .messages({
            'any.required': 'Date of birth is required',
            'any.invalid': 'You must be at least 15 years old to register'
        }),
    idType: userBaseFields.idType.required().messages({
        'any.required': 'ID type is required'
    }),
    nationalIdHash: userBaseFields.nationalIdHash.required().messages({
        'any.required': 'National ID is required'
    })
};

// GeoJSON location schema
export const locationSchema = Joi.object({
    type: Joi.string()
        .valid('Point')
        .default('Point')
        .messages({
            'any.only': 'Location type must be Point'
        }),
    coordinates: Joi.array()
        .length(2)
        .items(Joi.number().required())
        .custom(coordinatesValidator)
        .messages({
            'array.length': 'Coordinates must have exactly 2 values [longitude, latitude]',
            'any.invalid': 'Invalid coordinate values'
        })
});

export const requiredLocationSchema = locationSchema.required().messages({
    'any.required': 'Location is required'
});

// Location with label and address
export const fullLocationSchema = Joi.object({
    location: locationSchema,
    locationLabel: Joi.string()
        .max(500)
        .messages({
            'string.max': 'Location label cannot exceed 500 characters'
        }),
    address: Joi.string()
        .max(1000)
        .messages({
            'string.max': 'Address cannot exceed 1000 characters'
        })
});

export const requiredFullLocationSchema = Joi.object({
    location: requiredLocationSchema,
    locationLabel: Joi.string()
        .max(500)
        .required()
        .messages({
            'string.max': 'Location label cannot exceed 500 characters',
            'any.required': 'Location label is required'
        }),
    address: Joi.string()
        .max(1000)
        .optional()
        .messages({
            'string.max': 'Address cannot exceed 1000 characters'
        })
});

// Pagination schema
export const paginationSchema = {
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional()
        .messages({
            'number.min': 'Page must be at least 1'
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .optional()
        .messages({
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        })
};

// Sort schema
export const sortSchema = {
    sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'fullName', 'email', 'status')
        .default('createdAt')
        .optional(),
    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .optional()
};

// Reporter schema (for cases)
export const reporterSchema = Joi.object({
    type: Joi.string()
        .valid('CITIZEN', 'GUEST')
        .required()
        .messages({
            'any.only': 'Reporter type must be CITIZEN or GUEST',
            'any.required': 'Reporter type is required'
        }),
    citizenId: optionalMongoIdSchema,
    fullName: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters',
            'string.max': 'Full name cannot exceed 100 characters',
            'any.required': 'Full name is required'
        }),
    email: requiredEmailSchema,
    phone: requiredPhoneSchema,
    isVerified: Joi.boolean()
        .default(false)
        .optional()
});

// ─────────────── EXPORT ALL ───────────────

export default {
    passwordPattern,
    phonePattern,
    mongoIdPattern,
    Roles,
    UserStatus,
    Gender,
    IdType,
    AuthProvider,
    CaseStatus,
    CrimeType,
    Severity,
    FileType,
    UpdateType,
    Visibility,
    TenantType,
    emailSchema,
    requiredEmailSchema,
    phoneSchema,
    requiredPhoneSchema,
    passwordSchema,
    requiredPasswordSchema,
    mongoIdSchema,
    requiredMongoIdSchema,
    optionalMongoIdSchema,
    minAgeValidator,
    coordinatesValidator,
    userBaseFields,
    requiredUserBaseFields,
    locationSchema,
    requiredLocationSchema,
    fullLocationSchema,
    requiredFullLocationSchema,
    paginationSchema,
    sortSchema,
    reporterSchema
};
