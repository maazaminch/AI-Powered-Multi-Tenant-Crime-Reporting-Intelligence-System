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

                const message = error.details
                    .map((item) => item.message)
                    .join(", ");

                return next(
                    new apiError(
                        400,
                        message
                    )
                );

            }


            next(error);

        }

    };
};

export default validate;