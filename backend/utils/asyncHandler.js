/**
 * Wraps async route handlers to forward errors to Express error middleware.
 * Eliminates try/catch boilerplate.
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware function
 */
export default function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
