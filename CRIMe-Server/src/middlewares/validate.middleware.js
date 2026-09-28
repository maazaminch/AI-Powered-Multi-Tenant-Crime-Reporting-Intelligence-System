import apiError from "../utils/apiError.js";

const validate = (schema) => {
  return (req, res, next) => {
    for (const key of ["params", "query", "body"]) {
      if (!schema[key]) continue;

      // Convert empty strings to undefined before validation
      const dataToValidate = { ...req[key] };
      Object.keys(dataToValidate).forEach((k) => {
        if (dataToValidate[k] === "") {
          dataToValidate[k] = undefined;
        }
      });

      const { value, error } = schema[key].validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const message = error.details
          .map((d) => d.message)
          .join(", ");

        return next(new apiError(400, message));
      }

      // Handle read-only properties like req.query
      if (key === "query") {
        Object.assign(req[key], value);
      } else {
        req[key] = value;
      }
    }

    next();
  };
};

export default validate;