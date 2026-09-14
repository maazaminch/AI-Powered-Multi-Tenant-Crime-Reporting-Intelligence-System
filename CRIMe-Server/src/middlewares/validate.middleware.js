// middlewares/validate.middleware.js

import apiError from "../utils/apiError.js";

const validate = (schema) => {
    return async (req, res, next) => {

        try {

            const validatedData = {};

            // Validate body
            if (schema.body) {
                validatedData.body = await schema.body.validateAsync(
                    req.body,
                    {
                        abortEarly: false,
                        stripUnknown: true
                    }
                );
            }

            // Validate query
            if (schema.query) {
                validatedData.query = await schema.query.validateAsync(
                    req.query,
                    {
                        abortEarly: false,
                        stripUnknown: true
                    }
                );
            }

            // Validate params
            if (schema.params) {
                validatedData.params = await schema.params.validateAsync(
                    req.params,
                    {
                        abortEarly: false,
                        stripUnknown: true
                    }
                );
            }

            // Only overwrite body because Express manages
            // req.query and req.params internally.
            if (validatedData.body) {
                req.body = validatedData.body;
            }

            next();

        } catch (error) {

            if (error.details) {

                const errors = error.details.reduce((acc, item) => {

                    const field = item.path.join('.');

                    acc[field] = item.message;

                    return acc;

                }, {});

                return next(
                    new apiError(
                        400,
                        "Validation failed",
                        { errors }
                    )
                );
            }

            next(error);
        }
    };
};

export default validate;