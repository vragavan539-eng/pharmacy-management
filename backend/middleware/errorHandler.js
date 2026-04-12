const errorHandler = (err, req, res, next) => {
  let status  = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status  = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status  = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. Please use a different value.`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    status  = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  console.error(`[${new Date().toISOString()}] ${status} ${req.method} ${req.path}:`, message);

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
