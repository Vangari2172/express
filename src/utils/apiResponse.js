/**
 * Simple API Response Wrapper
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {any} data - Response data (optional)
 */
const apiSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} error - Error title/type
 * @param {string} message - Detailed error message
 */
const apiError = (res, statusCode = 500, error = 'Internal Server Error', message = 'An error occurred') => {
  const response = {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  return res.status(statusCode).json(response);
};

export { apiSuccess, apiError };
