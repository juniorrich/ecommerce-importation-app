/**
 * Strips keys that look like Mongo operators ("$..." ) or contain "."
 * from req.body, req.query, and req.params, recursively.
 * Prevents NoSQL operator injection (e.g. { "email": { "$ne": null } }).
 */
const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = sanitizeValue(value[key]);
    }
    return clean;
  }

  return value;
};

const mongoSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  // req.query is a getter-only property on some Express/Node versions;
  // mutate its keys in place instead of reassigning it.
  if (req.query && typeof req.query === 'object') {
    const cleanQuery = sanitizeValue(req.query);
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, cleanQuery);
  }
  next();
};

module.exports = mongoSanitize;
