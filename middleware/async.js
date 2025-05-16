/**
 * Async handler to wrap async route handlers
 * This eliminates the need for try-catch blocks in controller functions
 * @param {Function} fn - The async controller function to wrap
 * @returns {Function} - Express middleware function that handles errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
