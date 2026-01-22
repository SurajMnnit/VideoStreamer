import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { setSocketIO } from '../services/videoProcessingService.js';

export const setupSocket = (io) => {
    // Set socket.io instance for video processing service
    setSocketIO(io);

    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || !user.isActive) {
                return next(new Error('User not found or inactive'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.user.username} (${socket.id})`);

        // Join user's personal room for targeted events
        const userRoom = `user_${socket.user._id}`;
        socket.join(userRoom);

        // Send connection confirmation
        socket.emit('connected', {
            message: 'Connected to real-time updates',
            userId: socket.user._id,
            username: socket.user.username
        });

        // Handle video room subscription
        socket.on('subscribe_video', (videoId) => {
            socket.join(`video_${videoId}`);
            console.log(`📺 ${socket.user.username} subscribed to video: ${videoId}`);
        });

        socket.on('unsubscribe_video', (videoId) => {
            socket.leave(`video_${videoId}`);
            console.log(`📺 ${socket.user.username} unsubscribed from video: ${videoId}`);
        });

        // Handle disconnect
        socket.on('disconnect', (reason) => {
            console.log(`🔌 Socket disconnected: ${socket.user.username} - ${reason}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`❌ Socket error for ${socket.user.username}:`, error);
        });
    });

    console.log('✅ Socket.io configured');
};
