import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Use environment variable for Socket URL, fallback to localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [videoProgress, setVideoProgress] = useState({});
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            const token = localStorage.getItem('token');

            const newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
            });

            newSocket.on('connect', () => {
                console.log('🔌 Socket connected');
                setConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('🔌 Socket disconnected:', reason);
                setConnected(false);
            });

            newSocket.on('connected', (data) => {
                console.log('✅ Socket authenticated:', data);
            });

            newSocket.on('video_progress', (data) => {
                console.log('📺 Video progress:', data);

                setVideoProgress((prev) => ({
                    ...prev,
                    [data.videoId]: data,
                }));

                // Show toast for status changes
                if (data.status === 'safe') {
                    toast.success(`Video processing complete - Safe`);
                } else if (data.status === 'flagged') {
                    toast('Video flagged for review', { icon: '⚠️' });
                } else if (data.status === 'error') {
                    toast.error(`Video processing failed: ${data.message}`);
                }
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
                setConnected(false);
            }
        }
    }, [isAuthenticated]);

    const subscribeToVideo = (videoId) => {
        if (socket && connected) {
            socket.emit('subscribe_video', videoId);
        }
    };

    const unsubscribeFromVideo = (videoId) => {
        if (socket && connected) {
            socket.emit('unsubscribe_video', videoId);
        }
    };

    const getVideoProgress = (videoId) => {
        return videoProgress[videoId] || null;
    };

    const clearVideoProgress = (videoId) => {
        setVideoProgress((prev) => {
            const updated = { ...prev };
            delete updated[videoId];
            return updated;
        });
    };

    const value = {
        socket,
        connected,
        videoProgress,
        subscribeToVideo,
        unsubscribeFromVideo,
        getVideoProgress,
        clearVideoProgress,
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};
