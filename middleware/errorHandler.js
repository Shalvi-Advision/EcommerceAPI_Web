const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error, tagged with the tenant so failures are attributable per tenant.
  console.error(`Error [tenant=${req.tenant?.slug || '-'}]:`, err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Standard error envelope (plan §6): both `message` (the routes' convention)
  // and `error` (legacy) carry the same text so any client reading either works.
  const finalMessage = error.message || 'Server Error';
  res.status(error.statusCode || 500).json({
    success: false,
    message: finalMessage,
    error: finalMessage,
    tenant: req.tenant?.slug || null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
