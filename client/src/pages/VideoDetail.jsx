import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { videoAPI, API_URL } from '../api';
import { useSocket } from '../context/SocketContext';
import VideoPlayer from '../components/VideoPlayer';
import { VideoDetailSkeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Upload,
    Eye,
    Calendar,
    HardDrive,
    Tag,
    RefreshCw,
    Trash2,
    Edit3,
    Shield,
    AlertOctagon,
    Zap
} from 'lucide-react';
import { formatDate, formatFileSize, formatDuration } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
    uploaded: { icon: Upload, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Uploaded' },
    processing: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Processing' },
    processed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Processed' },
    safe: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Safe' },
    flagged: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Flagged' },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Error' }
};

const VideoDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reprocessing, setReprocessing] = useState(false);
    const { videoProgress, subscribeToVideo, unsubscribeFromVideo } = useSocket();
    const { canUpload } = useAuth();

    useEffect(() => {
        fetchVideo();
        subscribeToVideo(id);
        return () => unsubscribeFromVideo(id);
    }, [id]);

    useEffect(() => {
        if (videoProgress && videoProgress.videoId === id) {
            setVideo(prev => prev ? {
                ...prev,
                status: videoProgress.status,
                processingProgress: videoProgress.progress,
                sensitivityScore: videoProgress.sensitivityScore,
                sensitivityDetails: videoProgress.sensitivityDetails
            } : prev);
        }
    }, [videoProgress, id]);

    const fetchVideo = async () => {
        try {
            const res = await videoAPI.getById(id);
            setVideo(res.data.video);
        } catch (error) {
            toast.error('Failed to load video');
            navigate('/videos');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;

        try {
            await videoAPI.delete(id);
            toast.success('Video deleted');
            navigate('/videos');
        } catch (error) {
            toast.error('Failed to delete video');
        }
    };

    const handleReprocess = async () => {
        setReprocessing(true);
        try {
            await videoAPI.reprocess(id);
            toast.success('Video queued for reprocessing');
            fetchVideo();
        } catch (error) {
            toast.error('Failed to reprocess video');
        } finally {
            setReprocessing(false);
        }
    };

    if (loading) return <VideoDetailSkeleton />;
    if (!video) return null;

    const config = statusConfig[video.status] || statusConfig.uploaded;
    const StatusIcon = config.icon;
    const canPlay = ['processed', 'safe', 'flagged'].includes(video.status);
    const streamUrl = `${API_URL}/videos/${id}/stream`;
    const token = localStorage.getItem('token');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Back Button */}
            <Link
                to="/videos"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Library
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="player-container"
                    >
                        {canPlay ? (
                            <VideoPlayer
                                src={`${streamUrl}?token=${token}`}
                                title={video.title}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                                {video.status === 'processing' ? (
                                    <>
                                        <div className="relative mb-6">
                                            <div className="w-20 h-20 rounded-full border-4 border-slate-700" />
                                            <motion.div
                                                className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-amber-400">
                                                {video.processingProgress}%
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-medium text-white mb-2">Processing Video</h3>
                                        <p className="text-sm text-slate-400">Your video is being analyzed...</p>
                                    </>
                                ) : (
                                    <>
                                        <StatusIcon className={`w-16 h-16 ${config.color} mb-4`} />
                                        <h3 className="text-lg font-medium text-white mb-2">{config.label}</h3>
                                        <p className="text-sm text-slate-400">
                                            {video.status === 'error' ? video.errorMessage : 'Video cannot be played'}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Title & Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card"
                    >
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="text-2xl font-bold text-white">{video.title}</h1>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border`}>
                                <StatusIcon className={`w-4 h-4 ${config.color}`} />
                                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                            </div>
                        </div>

                        {video.description && (
                            <p className="text-slate-400 mb-4">{video.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                {video.views || 0} views
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {formatDate(video.createdAt)}
                            </span>
                            <span className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4" />
                                {formatFileSize(video.size)}
                            </span>
                            {video.duration && (
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {formatDuration(video.duration)}
                                </span>
                            )}
                        </div>

                        {video.tags && video.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                                <Tag className="w-4 h-4 text-slate-500" />
                                <div className="flex flex-wrap gap-2">
                                    {video.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full text-xs bg-slate-800/50 text-slate-400 border border-slate-700/50"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Sensitivity Analysis */}
                    {typeof video.sensitivityScore === 'number' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white">Sensitivity Analysis</h3>
                                    <p className="text-xs text-slate-500">AI content moderation</p>
                                </div>
                            </div>

                            {/* Score Circle */}
                            <div className="flex justify-center my-6">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-slate-700"
                                        />
                                        <motion.circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            fill="none"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: '0 352' }}
                                            animate={{ strokeDasharray: `${(video.sensitivityScore / 100) * 352} 352` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={
                                                video.sensitivityScore > 70 ? 'stroke-red-500' :
                                                    video.sensitivityScore > 40 ? 'stroke-amber-500' :
                                                        'stroke-emerald-500'
                                            }
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-3xl font-bold ${video.sensitivityScore > 70 ? 'text-red-400' :
                                            video.sensitivityScore > 40 ? 'text-amber-400' :
                                                'text-emerald-400'
                                            }`}>
                                            {video.sensitivityScore}%
                                        </span>
                                        <span className="text-xs text-slate-500">Score</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Breakdown */}
                            {video.sensitivityDetails && typeof video.sensitivityDetails === 'object' && (
                                <div className="space-y-3">
                                    {Object.entries(video.sensitivityDetails).map(([key, value]) => {
                                        // Ensure value is a number
                                        const numValue = typeof value === 'number' ? value : 0;
                                        return (
                                            <div key={key}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                    <span className={`font-medium ${numValue > 70 ? 'text-red-400' : numValue > 40 ? 'text-amber-400' : 'text-emerald-400'
                                                        }`}>{numValue}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full rounded-full ${numValue > 70 ? 'bg-red-500' : numValue > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                                            }`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${numValue}%` }}
                                                        transition={{ duration: 0.8, delay: 0.3 }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Actions */}
                    {canUpload && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="card space-y-3"
                        >
                            <h3 className="text-sm font-medium text-white mb-4">Actions</h3>

                            <button
                                onClick={handleReprocess}
                                disabled={reprocessing || video.status === 'processing'}
                                className="btn-secondary w-full justify-start"
                            >
                                <RefreshCw className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
                                {reprocessing ? 'Reprocessing...' : 'Reprocess Video'}
                            </button>

                            <button
                                onClick={handleDelete}
                                className="btn w-full justify-start bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Video
                            </button>
                        </motion.div>
                    )}

                    {/* Processing Steps */}
                    {video.status === 'processing' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="card"
                        >
                            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                Processing Steps
                            </h3>

                            <div className="space-y-3">
                                {['Upload Complete', 'Processing', 'Analyzing', 'Complete'].map((step, i) => {
                                    const progress = video.processingProgress;
                                    const isComplete = (i === 0) || (i === 1 && progress >= 25) || (i === 2 && progress >= 50) || (i === 3 && progress === 100);
                                    const isActive = (i === 1 && progress < 25 && progress > 0) ||
                                        (i === 2 && progress >= 25 && progress < 75) ||
                                        (i === 3 && progress >= 75 && progress < 100);

                                    return (
                                        <div key={step} className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isComplete ? 'bg-emerald-500' : isActive ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'
                                                }`}>
                                                {isComplete ? (
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                ) : (
                                                    <span className="text-xs text-white">{i + 1}</span>
                                                )}
                                            </div>
                                            <span className={`text-sm ${isComplete ? 'text-emerald-400' : isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default VideoDetail;
