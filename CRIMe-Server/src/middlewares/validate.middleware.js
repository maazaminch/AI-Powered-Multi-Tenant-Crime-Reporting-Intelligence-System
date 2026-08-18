// middlewares/validate.middleware.js

import apiError from "../utils/apiError.js";

const validate = (schema) => {
    return async (req, res, next) => {

        try {

            const validatedData = await schema.validateAsync(
                {
                    body: req.body,
                    query: req.query,
                    params: req.params
                },
                {
                    abortEarly: false,
                    stripUnknown: true
                }
            );


            // overwrite request data with validated values
            req.body = validatedData.body;
            req.query = validatedData.query;
            req.params = validatedData.params;

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