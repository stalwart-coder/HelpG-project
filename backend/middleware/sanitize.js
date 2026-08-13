/**
 * XSS Sanitization Middleware
 *
 * Recursively sanitizes all string values in req.body, req.query, and req.params
 * by encoding HTML entities. Prevents stored and reflected XSS attacks.
 *
 * Uses simple entity encoding — no external dependency needed.
 * This is applied as global middleware after body parsing.
 */

/**
 * Encode HTML entities in a string to prevent XSS.
 */
function encodeHtmlEntities(str) {
  if (typeof str !== 'string') return str;

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Recursively sanitize all string values in an object.
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return encodeHtmlEntities(obj);
  }

  return obj;
}

/**
 * Middleware that sanitizes all user-supplied input.
 * Applied AFTER body parsing so we process raw strings.
 */
export function sanitizeInput(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
}

export default sanitizeInput;
</parameter>
</invoke>
</｜｜DSML｜｜tool_calls>
