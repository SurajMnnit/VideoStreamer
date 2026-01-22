import authRoutes from './authRoutes.js';
import videoRoutes from './videoRoutes.js';
import userRoutes from './userRoutes.js';

export const setupRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/videos', videoRoutes);
    app.use('/api/users', userRoutes);

    // Health check route
    app.get('/api/health', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString()
        });
    });
};
