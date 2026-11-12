export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `An entry with this ${field} already exists.`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // Handle Multer upload errors (File size, file count)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the allowed limit (maximum 5MB per photo).',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Maximum 6 photos allowed per upload.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle file format rejections from fileFilter
  if (err.message && err.message.includes('Only JPG, PNG, and WebP images are allowed')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Default generic error
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
