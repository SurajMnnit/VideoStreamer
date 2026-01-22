import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler } from './errorHandler.js';

// Protect routes - require authentication
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized to access this route. Please log in.');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user and attach to request
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new ApiError(401, 'User no longer exists.');
        }

        if (!user.isActive) {
            throw new ApiError(401, 'User account has been deactivated.');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Invalid token. Please log in again.');
        }
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token expired. Please log in again.');
        }
        throw error;
    }
});

// Authorize specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, 'Not authenticated.');
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Role '${req.user.role}' is not authorized to access this route.`);
        }

        next();
    };
};

// Check if user owns resource or is admin
export const ownerOrAdmin = (resourceOwnerField = 'owner') => {
    return asyncHandler(async (req, res, next) => {
        // Admins can access everything
        if (req.user.role === 'admin') {
            return next();
        }

        // Resource owner check will be done in the controller
        req.checkOwnership = true;
        req.ownerField = resourceOwnerField;
        next();
    });
};
