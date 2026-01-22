// Custom error class for API errors
export class ApiError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new ApiError(404, message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = new ApiError(400, message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        const message = messages.join('. ');
        error = new ApiError(400, message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token. Please log in again.');
    }

    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired. Please log in again.');
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error = new ApiError(400, 'File too large. Maximum size is 100MB.');
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = new ApiError(400, 'Unexpected file field.');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        status: error.status || 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
