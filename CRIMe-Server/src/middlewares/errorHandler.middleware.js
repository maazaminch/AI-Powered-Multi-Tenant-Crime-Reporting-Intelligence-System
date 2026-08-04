import { isCelebrateError } from "celebrate";
import apiResponse from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
    console.error("ERROR:", err);

    let statusCode = 500;
    let message = "Internal Server Error";

    // ------------------------------
    // Celebrate / Joi
    // ------------------------------
    if (isCelebrateError(err)) {
        const firstError = [...err.details.values()][0];

        statusCode = 400;
        message = firstError.details[0].message;

        return res
            .status(statusCode)
            .json(new apiResponse(statusCode, null, message));
    }

    // ------------------------------
    // Mongoose Validation
    // ------------------------------
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(e => e.message)
            .join(", ");
    }

    // ------------------------------
    // Duplicate Key
    // ------------------------------
    else if (err.code === 11000) {
        statusCode = 409;
        message = `${Object.keys(err.keyValue)[0]} already exists`;
    }

    // ------------------------------
    // JWT
    // ------------------------------
    else if (
        err.name === "JsonWebTokenError" ||
        err.name === "TokenExpiredError"
    ) {
        statusCode = 401;
        message = "Invalid or expired token";
    }

    // ------------------------------
    // Custom apiError
    // ------------------------------
    else if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    }

    return res
        .status(statusCode)
        .json(new apiResponse(statusCode, null, message));
};

export default errorHandler;