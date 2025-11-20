const errorHandler = (error, req, res, next) => {
  console.error('Error:', error && error.message ? error.message : error);

  if (res.headersSent) return next(error);

  const status = error && error.status ? error.status : 500;
  const payload = { message: (error && error.message) || 'Server error' };

  if (process.env.NODE_ENV === 'development' && error) {
    payload.error = { message: error.message, stack: error.stack };
  }

  res.status(status).json(payload);
};

export default errorHandler;
