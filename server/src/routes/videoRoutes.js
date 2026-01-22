import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
    uploadVideo,
    getVideos,
    getVideo,
    updateVideo,
    deleteVideo,
    streamVideo,
    getVideoStats,
    reprocessVideo
} from '../controllers/videoController.js';
import { protect, authorize } from '../middlewares/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Special middleware for stream route that accepts token from query params
const streamAuth = async (req, res, next) => {
    try {
        let token = null;

        // Check for token in query params (for video element)
        if (req.query.token) {
            token = req.query.token;
        }
        // Also check Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Stream route with special auth (must be before protect middleware)
router.get('/:id/stream', streamAuth, streamVideo);

// All other routes are protected with standard auth
router.use(protect);

// Stats route
router.get('/stats', getVideoStats);

// Upload route (editor and admin only)
router.post(
    '/upload',
    authorize('editor', 'admin'),
    upload.single('video'),
    uploadVideo
);

// CRUD routes
router.get('/', getVideos);
router.get('/:id', getVideo);
router.put('/:id', authorize('editor', 'admin'), updateVideo);
router.delete('/:id', authorize('editor', 'admin'), deleteVideo);

// Reprocess route (editor and admin only)
router.post('/:id/reprocess', authorize('editor', 'admin'), reprocessVideo);

export default router;
