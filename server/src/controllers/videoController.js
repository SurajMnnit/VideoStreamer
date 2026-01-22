import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Video from '../models/Video.js';
import { ApiError, asyncHandler } from '../middlewares/errorHandler.js';
import { addToProcessingQueue } from '../services/videoProcessingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private (editor, admin)
export const uploadVideo = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'Please upload a video file');
    }

    const { title, description, tags } = req.body;

    if (!title) {
        throw new ApiError(400, 'Please provide a video title');
    }

    // Create video record
    const video = await Video.create({
        title,
        description: description || '',
        filename: req.file.filename,
        originalName: req.file.originalname,
        filepath: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        owner: req.user.id,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        status: 'uploaded'
    });

    // Add to processing queue
    addToProcessingQueue(video);

    res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        video: {
            id: video._id,
            title: video.title,
            description: video.description,
            filename: video.filename,
            originalName: video.originalName,
            size: video.size,
            status: video.status,
            createdAt: video.createdAt
        }
    });
});

// @desc    Get all videos (user's own videos)
// @route   GET /api/videos
// @access  Private
export const getVideos = asyncHandler(async (req, res) => {
    const { status, search, sort, page = 1, limit = 12 } = req.query;

    // Build query
    const query = {};

    // Multi-tenant: users can only see their own videos (admin sees all)
    if (req.user.role !== 'admin') {
        query.owner = req.user.id;
    }

    // Filter by status
    if (status && ['uploaded', 'processing', 'processed', 'flagged', 'safe', 'error'].includes(status)) {
        query.status = status;
    }

    // Search by title or description
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'size') sortOption = { size: -1 };

    const [videos, total] = await Promise.all([
        Video.find(query)
            .populate('owner', 'username email')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Video.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        count: videos.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        videos
    });
});

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
export const getVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id).populate('owner', 'username email');

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && video.owner._id.toString() !== req.user.id) {
        throw new ApiError(403, 'Not authorized to access this video');
    }

    res.status(200).json({
        success: true,
        video
    });
});

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private (owner or admin)
export const updateVideo = asyncHandler(async (req, res) => {
    let video = await Video.findById(req.params.id);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && video.owner.toString() !== req.user.id) {
        throw new ApiError(403, 'Not authorized to update this video');
    }

    const { title, description, tags } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());

    video = await Video.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    ).populate('owner', 'username email');

    res.status(200).json({
        success: true,
        video
    });
});

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (owner or admin)
export const deleteVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && video.owner.toString() !== req.user.id) {
        throw new ApiError(403, 'Not authorized to delete this video');
    }

    // Delete file from disk
    if (video.filepath && fs.existsSync(video.filepath)) {
        fs.unlinkSync(video.filepath);
    }

    if (video.processedFilepath && fs.existsSync(video.processedFilepath)) {
        fs.unlinkSync(video.processedFilepath);
    }

    await Video.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Video deleted successfully'
    });
});

// @desc    Stream video
// @route   GET /api/videos/:id/stream
// @access  Private
export const streamVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && video.owner.toString() !== req.user.id) {
        throw new ApiError(403, 'Not authorized to stream this video');
    }

    const videoPath = video.processedFilepath || video.filepath;

    if (!fs.existsSync(videoPath)) {
        throw new ApiError(404, 'Video file not found');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        // HTTP Range request for streaming
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;

        const file = fs.createReadStream(videoPath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': video.mimetype
        });

        file.pipe(res);
    } else {
        // No range request, send entire file
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': video.mimetype
        });

        fs.createReadStream(videoPath).pipe(res);
    }

    // Increment view count
    Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();
});

// @desc    Get video stats
// @route   GET /api/videos/stats
// @access  Private
export const getVideoStats = asyncHandler(async (req, res) => {
    const matchStage = req.user.role === 'admin'
        ? {}
        : { owner: req.user._id };

    const stats = await Video.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalSize: { $sum: '$size' }
            }
        }
    ]);

    const totalVideos = stats.reduce((acc, s) => acc + s.count, 0);
    const totalSize = stats.reduce((acc, s) => acc + s.totalSize, 0);

    const statusCounts = {
        uploaded: 0,
        processing: 0,
        processed: 0,
        flagged: 0,
        safe: 0,
        error: 0
    };

    stats.forEach(s => {
        statusCounts[s._id] = s.count;
    });

    res.status(200).json({
        success: true,
        stats: {
            totalVideos,
            totalSize,
            statusCounts
        }
    });
});

// @desc    Reprocess video
// @route   POST /api/videos/:id/reprocess
// @access  Private (editor, admin)
export const reprocessVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && video.owner.toString() !== req.user.id) {
        throw new ApiError(403, 'Not authorized to reprocess this video');
    }

    // Reset video status
    video.status = 'uploaded';
    video.processingProgress = 0;
    video.sensitivityScore = null;
    video.sensitivityDetails = null;
    video.errorMessage = null;
    await video.save();

    // Add to processing queue
    addToProcessingQueue(video);

    res.status(200).json({
        success: true,
        message: 'Video queued for reprocessing',
        video
    });
});
