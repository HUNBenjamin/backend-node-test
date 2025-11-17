const errorHandler = (error, req, res, next) => {
  console.error('Error:', error && error.message ? error.message : error);

  // Generic error response
  res.status(error.status || 500).json({
    message: error.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' ? { error } : {}),
  });
};

export default errorHandler;
