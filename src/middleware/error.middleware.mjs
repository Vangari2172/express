import { apiError } from '../utils/apiResponse.js';

/**
 * Global Error Handling Middleware.
 * This middleware catches all errors passed by `next(error)` and sends a
 * standardized JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  // Default to a 500 Internal Server Error if no status is set
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred.';

  // Handle specific Mongoose errors
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    // Combine all Mongoose validation error messages into one string
    message = Object.values(err.errors).map(error => error.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409; // Conflict
    // Create a user-friendly message for duplicate key errors (e.g., email)
    const field = Object.keys(err.keyValue)[0];
    message = `An account with that ${field} already exists.`;
  }

  if (err.name === 'CastError') {
    statusCode = 400; // Bad Request
    message = `Invalid format for field ${err.path}: ${err.value}.`;
  }

  // In development mode, send the full error stack for easier debugging
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Use the apiError utility to send the final response
  // We manually build the response object above to customize it based on the error type
  return res.status(statusCode).json(errorResponse);
};

export { errorHandler };
