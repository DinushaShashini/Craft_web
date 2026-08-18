/**
 * validate(schema) – request validation middleware
 * Uses a simple schema object: { body: {}, query: {}, params: {} }
 * Each key in body/query/params can define: required, type, minLength, maxLength, pattern, enum
 *
 * Usage:
 *   router.post('/', validate({ body: { name: { required: true }, email: { required: true, type: 'email' } } }), handler);
 */

const AppError = require('../utils/AppError');

function coerce(value, type) {
  if (type === 'number') return Number(value);
  if (type === 'boolean') return value === 'true' || value === true;
  return value;
}

function validateField(value, rules, fieldName) {
  if (rules.required && (value === undefined || value === null || value === '')) {
    return `${fieldName} is required.`;
  }

  if (value === undefined || value === null || value === '') return null;

  if (rules.type === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return `${fieldName} must be a valid email address.`;
    }
  }

  if (rules.type === 'number') {
    if (isNaN(Number(value))) return `${fieldName} must be a number.`;
  }

  if (rules.minLength && String(value).length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters.`;
  }

  if (rules.maxLength && String(value).length > rules.maxLength) {
    return `${fieldName} must be at most ${rules.maxLength} characters.`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.patternMessage || `${fieldName} format is invalid.`;
  }

  if (rules.enum && !rules.enum.includes(value)) {
    return `${fieldName} must be one of: ${rules.enum.join(', ')}.`;
  }

  return null;
}

function validate(schema = {}) {
  return function validationMiddleware(req, res, next) {
    const errors = [];

    for (const [section, rules] of Object.entries(schema)) {
      if (!['body', 'query', 'params'].includes(section)) continue;
      const source = req[section] || {};

      for (const [field, fieldRules] of Object.entries(rules)) {
        const value = source[field];
        const error = validateField(value, fieldRules, field);
        if (error) errors.push(error);

        // Coerce type in body
        if (section === 'body' && fieldRules.type && value !== undefined) {
          req.body[field] = coerce(value, fieldRules.type);
        }
      }
    }

    if (errors.length > 0) {
      return next(new AppError(errors.join(' '), 400));
    }

    next();
  };
}

module.exports = validate;
