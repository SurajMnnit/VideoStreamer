import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import {
    Play,
    Clock,
    CheckCircle,
    AlertTriangle,
    Upload,
    XCircle,
    Eye,
    MoreVertical,
    Trash2,
    Edit3
} from 'lucide-react';
import { formatDate, formatFileSize, formatDuration } from '../utils/helpers';

const statusConfig = {
    uploaded: {
        icon: Upload,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        label: 'Uploaded',
        animation: false
    },
    processing: {
        icon: Clock,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        label: 'Processing',
        animation: true
    },
    processed: {
        icon: CheckCircle,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        label: 'Processed',
        animation: false
    },
    safe: {
        icon: CheckCircle,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        label: 'Safe',
        animation: false
    },
    flagged: {
        icon: AlertTriangle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        label: 'Flagged',
        animation: false
    },
    error: {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        label: 'Error',
        animation: false
    }
};

const VideoCard = ({ video, onDelete }) => {
    const { videoProgress } = useSocket();

    // Check for real-time updates
    const currentProgress = videoProgress?.videoId === video._id
        ? videoProgress.progress
        : video.processingProgress;

    const currentStatus = videoProgress?.videoId === video._id
        ? videoProgress.status
        : video.status;

    const config = statusConfig[currentStatus] || statusConfig.uploaded;
    const StatusIcon = config.icon;

    const canPlay = ['processed', 'safe', 'flagged'].includes(currentStatus);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group glass-card overflow-hidden hover:border-slate-600/50 hover:shadow-xl hover:shadow-indigo-500/5"
        >
            {/* Thumbnail */}
            <Link to={`/videos/${video._id}`} className="block relative aspect-video overflow-hidden bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10" />

                {/* Placeholder - Gradient based on title */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(135deg, 
              hsl(${video.title.charCodeAt(0) * 3}, 70%, 20%) 0%, 
              hsl(${video.title.charCodeAt(0) * 3 + 40}, 60%, 15%) 100%)`
                    }}
                />

                {/* Play Button Overlay */}
                {canPlay && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
                        >
                            <Play className="w-6 h-6 text-white ml-1" />
                        </motion.div>
                    </div>
                )}

                {/* Processing Progress */}
                {currentStatus === 'processing' && (
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white/80">Processing...</span>
                            <span className="text-xs font-medium text-amber-400">{currentProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${currentProgress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-20">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} ${config.border} border backdrop-blur-md`}>
                        {config.animation && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                            </span>
                        )}
                        {!config.animation && <StatusIcon className={`w-3 h-3 ${config.color}`} />}
                        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                </div>

                {/* Duration */}
                {video.duration && (
                    <div className="absolute bottom-3 right-3 z-20 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                        <span className="text-xs text-white font-medium">{formatDuration(video.duration)}</span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4">
                <Link to={`/videos/${video._id}`}>
                    <h3 className="text-sm font-semibold text-slate-100 mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {video.title}
                    </h3>
                </Link>

                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {video.views || 0}
                        </span>
                        <span>{formatFileSize(video.size)}</span>
                    </div>
                    <span>{formatDate(video.createdAt)}</span>
                </div>

                {/* Sensitivity Score (if available) */}
                {typeof video.sensitivityScore === 'number' && currentStatus !== 'processing' && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-slate-400">Sensitivity</span>
                            <span className={`text-xs font-medium ${video.sensitivityScore > 70 ? 'text-red-400' :
                                video.sensitivityScore > 40 ? 'text-amber-400' :
                                    'text-emerald-400'
                                }`}>
                                {video.sensitivityScore}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${video.sensitivityScore > 70
                                    ? 'bg-gradient-to-r from-red-500 to-rose-500'
                                    : video.sensitivityScore > 40
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                        : 'bg-gradient-to-r from-emerald-500 to-green-500'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${video.sensitivityScore}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default VideoCard;
