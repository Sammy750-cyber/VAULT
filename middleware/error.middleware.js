// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Log error for debugging
  console.error(`[Error] ${err.statusCode}: ${err.message}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Duplicate entry - resource already exists",
    });
  }

  if (err.code === "ECONNREFUSED") {
    return res.status(503).json({
      message: "Service unavailable - database connection failed",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      details: err.message,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Authentication token expired",
    });
  }

  // Handle multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File too large",
    });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      message: "Too many files",
    });
  }

  // Send response
  res.status(err.statusCode).json({
    message: err.isOperational ? err.message : "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// Async handler wrapper to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { asyncHandler, AppError };
export default errorHandler;
