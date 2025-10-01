/**
 * asyncHandler is a higher-order function that wraps async route handlers.
 * It catches any errors that occur in the async function and passes them
 * to the next middleware (the global error handler).
 * @param {Function} requestHandler - The asynchronous route handler function.
 * @returns {Function} An Express route handler with error handling.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
