const { ZodError } = require('zod');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { ApiError, notFoundHandler, errorHandler };
