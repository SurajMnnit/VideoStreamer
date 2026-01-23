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
    Calendar,
    FileText
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
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        label: 'Safe Content',
        animation: false
    },
    flagged: {
        icon: AlertTriangle,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
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

const VideoCard = ({ video }) => {
    const { videoProgress } = useSocket();

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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            className="group glass-card overflow-hidden hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/5 duration-300"
        >
            {/* Thumbnail Area */}
            <Link to={`/videos/${video._id}`} className="block relative aspect-[16/10] overflow-hidden bg-[#0A0F1A]">
                {/* Modern Gradient Placeholder */}
                <div
                    className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-700"
                    style={{
                        background: `linear-gradient(135deg, #0A0F1A 0%, 
                            ${video.sensitivityScore > 70 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 230, 255, 0.1)'} 50%, #080C16 100%)`
                    }}
                />

                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

                {/* Interactive Play/Hover Overlay */}
                <div className="absolute inset-0 bg-[#080C16]/20 group-hover:bg-cyan-500/10 transition-all duration-300" />

                {canPlay && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                        <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
                            <Play className="w-6 h-6 text-black fill-current ml-1" />
                        </div>
                    </div>
                )}

                {/* Status Badge - VidGuard Style */}
                <div className="absolute top-4 left-4 z-20">
                    <div className={`badge ${config.bg} ${config.border} backdrop-blur-md px-3 py-1.5`}>
                        {config.animation ? (
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                            </span>
                        ) : (
                            <StatusIcon className={`w-3 h-3 ${config.color}`} />
                        )}
                        <span className={`text-[10px] uppercase font-black tracking-widest ml-1 ${config.color}`}>
                            {config.label}
                        </span>
                    </div>
                </div>

                {/* Duration Label */}
                {video.duration && (
                    <div className="absolute bottom-4 right-4 z-20 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-slate-700/50">
                        <span className="text-[10px] font-bold text-white tracking-widest">{formatDuration(video.duration)}</span>
                    </div>
                )}

                {/* Processing Overlay */}
                {currentStatus === 'processing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080C16]/80 backdrop-blur-sm px-6">
                        <div className="relative w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
                            <motion.div
                                className="absolute inset-y-0 left-0 gradient-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${currentProgress}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">{currentProgress}% ANALYZING</span>
                    </div>
                )}
            </Link>

            {/* Content Area */}
            <div className="p-5 space-y-4">
                <div>
                    <Link to={`/videos/${video._id}`}>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 leading-tight mb-1">
                            {video.title}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{formatDate(video.createdAt)}</span>
                        <span className="flex items-center gap-1.5"><FileText className="w-3 h-3" />{formatFileSize(video.size)}</span>
                    </div>
                </div>

                {/* AI Safety Metrics Section */}
                {typeof video.sensitivityScore === 'number' && currentStatus !== 'processing' && (
                    <div className="space-y-2 pt-4 border-t border-slate-800/50">
                        <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                            <span className="text-slate-500">Stability Score</span>
                            <span className={video.sensitivityScore > 70 ? 'text-rose-400' : 'text-cyan-400'}>
                                {100 - video.sensitivityScore}% SAFE
                            </span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${video.sensitivityScore > 70 ? 'bg-rose-500' : 'gradient-primary'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - video.sensitivityScore}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default VideoCard;
