import Video from '../models/Video.js';

// Socket.io instance will be set from server
let io = null;

export const setSocketIO = (socketIO) => {
    io = socketIO;
};

// Emit progress update to specific user
const emitProgress = (userId, videoId, data) => {
    if (io) {
        io.to(`user_${userId}`).emit('video_progress', {
            videoId,
            ...data
        });
    }
};

// Simulate video processing (FFmpeg mock)
export const processVideo = async (video) => {
    const userId = video.owner.toString();
    const videoId = video._id.toString();

    try {
        // Update status to processing
        video.status = 'processing';
        video.processingProgress = 0;
        await video.save();

        emitProgress(userId, videoId, {
            status: 'processing',
            progress: 0,
            message: 'Starting video processing...'
        });

        // Simulate processing stages
        const stages = [
            { progress: 10, message: 'Analyzing video format...', delay: 800 },
            { progress: 25, message: 'Extracting video metadata...', delay: 1000 },
            { progress: 40, message: 'Processing video frames...', delay: 1500 },
            { progress: 55, message: 'Applying optimizations...', delay: 1200 },
            { progress: 70, message: 'Running sensitivity analysis...', delay: 2000 },
            { progress: 85, message: 'Generating thumbnail...', delay: 1000 },
            { progress: 95, message: 'Finalizing processing...', delay: 800 },
            { progress: 100, message: 'Processing complete!', delay: 500 }
        ];

        for (const stage of stages) {
            await new Promise(resolve => setTimeout(resolve, stage.delay));

            video.processingProgress = stage.progress;
            await video.save();

            emitProgress(userId, videoId, {
                status: 'processing',
                progress: stage.progress,
                message: stage.message
            });
        }

        // Simulate sensitivity analysis (random result)
        const sensitivityScore = Math.random() * 100;
        const isFlagged = sensitivityScore > 70; // Flag if score > 70

        const sensitivityDetails = {
            score: Math.round(sensitivityScore),
            categories: {
                violence: Math.round(Math.random() * 100),
                adult: Math.round(Math.random() * 100),
                medical: Math.round(Math.random() * 100),
                racy: Math.round(Math.random() * 100)
            },
            analyzedAt: new Date().toISOString()
        };

        // Update video with results
        video.status = isFlagged ? 'flagged' : 'safe';
        video.sensitivityScore = Math.round(sensitivityScore);
        video.sensitivityDetails = sensitivityDetails;
        video.processedFilepath = video.filepath; // In real scenario, this would be different
        video.processingProgress = 100;

        // Mock duration (random between 30 seconds and 10 minutes)
        video.duration = Math.floor(Math.random() * (600 - 30 + 1)) + 30;

        await video.save();

        emitProgress(userId, videoId, {
            status: video.status,
            progress: 100,
            message: isFlagged ? 'Video flagged for review' : 'Video is safe and ready',
            sensitivityScore: video.sensitivityScore,
            sensitivityDetails
        });

        return video;

    } catch (error) {
        console.error('Video processing error:', error);

        video.status = 'error';
        video.errorMessage = error.message || 'Processing failed';
        await video.save();

        emitProgress(userId, videoId, {
            status: 'error',
            progress: 0,
            message: 'Processing failed: ' + (error.message || 'Unknown error'),
            error: true
        });

        throw error;
    }
};

// Queue for processing videos (simple in-memory queue)
const processingQueue = [];
let isProcessing = false;

export const addToProcessingQueue = async (video) => {
    processingQueue.push(video);

    if (!isProcessing) {
        processQueue();
    }
};

const processQueue = async () => {
    if (processingQueue.length === 0) {
        isProcessing = false;
        return;
    }

    isProcessing = true;
    const video = processingQueue.shift();

    try {
        await processVideo(video);
    } catch (error) {
        console.error('Queue processing error:', error);
    }

    // Process next in queue
    processQueue();
};

export default {
    setSocketIO,
    processVideo,
    addToProcessingQueue
};
