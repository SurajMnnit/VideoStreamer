import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { setupSocket } from './sockets/socketHandler.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            const clients = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim().replace(/\/$/, "")) : [];
            const isAllowed = clients.includes(origin) || origin.endsWith('.vercel.app') || origin === 'http://localhost:5173';
            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Setup socket handlers
        setupSocket(io);

        // Start listening
        httpServer.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🎬 Video Stream Server                                 ║
║                                                          ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║   Socket.io: Enabled                                     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    httpServer.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

startServer();
