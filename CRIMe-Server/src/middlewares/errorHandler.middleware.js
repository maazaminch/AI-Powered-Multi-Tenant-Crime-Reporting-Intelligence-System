import { isCelebrateError } from "celebrate"

const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err)

  let status = 500
  let message = "Internal server error"

  // Joi / Celebrate validation errors
  if (isCelebrateError(err)) {
    const bodyError = err.details.get("body")
    if (bodyError) {
      status = 400
      message = bodyError.details[0].message
    }
  }

  // Custom thrown errors (from controllers)
  if (err.statusCode) {
    status = err.statusCode
    message = err.message
  }

  res.status(status).json({ success: false, message })
}

export default errorHandler;








