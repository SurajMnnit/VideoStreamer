import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
        default: ''
    },
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filepath: {
        type: String,
        required: true
    },
    processedFilepath: {
        type: String,
        default: null
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'processed', 'flagged', 'safe', 'error'],
        default: 'uploaded'
    },
    processingProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    sensitivityScore: {
        type: Number,
        default: null,
        min: 0,
        max: 100
    },
    sensitivityDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    errorMessage: {
        type: String,
        default: null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
videoSchema.index({ owner: 1, status: 1 });
videoSchema.index({ createdAt: -1 });
videoSchema.index({ title: 'text', description: 'text' });

// Virtual for formatted size
videoSchema.virtual('formattedSize').get(function () {
    const bytes = this.size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
