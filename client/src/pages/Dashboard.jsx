import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { videoAPI } from '../api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import { StatCardSkeleton, VideoCardSkeleton } from '../components/Skeleton';
import {
    Video,
    Upload,
    Clock,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    PlayCircle,
    ArrowRight,
    Sparkles,
    BarChart3,
    HardDrive
} from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentVideos, setRecentVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { videoProgress } = useSocket();
    const { user, canUpload } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, videosRes] = await Promise.all([
                videoAPI.getStats(),
                videoAPI.getAll({ limit: 4, sort: 'newest' })
            ]);

            setStats(statsRes.data.stats);
            setRecentVideos(videosRes.data.videos);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update video when progress updates come in
    useEffect(() => {
        if (videoProgress) {
            setRecentVideos(prev =>
                prev.map(video => {
                    if (video._id === videoProgress.videoId) {
                        return {
                            ...video,
                            status: videoProgress.status,
                            processingProgress: videoProgress.progress,
                            sensitivityScore: videoProgress.sensitivityScore,
                            sensitivityDetails: videoProgress.sensitivityDetails
                        };
                    }
                    return video;
                })
            );
        }
    }, [videoProgress]);

    const statCards = [
        {
            title: 'Total Videos',
            value: stats?.totalVideos || 0,
            icon: Video,
            gradient: 'from-blue-500 to-indigo-500',
            bgGradient: 'from-blue-500/10 to-indigo-500/10'
        },
        {
            title: 'Processing',
            value: stats?.statusCounts?.processing || 0,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/10'
        },
        {
            title: 'Safe Videos',
            value: (stats?.statusCounts?.safe || 0) + (stats?.statusCounts?.processed || 0),
            icon: CheckCircle,
            gradient: 'from-emerald-500 to-green-500',
            bgGradient: 'from-emerald-500/10 to-green-500/10'
        },
        {
            title: 'Flagged',
            value: stats?.statusCounts?.flagged || 0,
            icon: AlertTriangle,
            gradient: 'from-red-500 to-rose-500',
            bgGradient: 'from-red-500/10 to-rose-500/10'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome Banner */}
            <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl glass border border-slate-700/50 p-8"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-sm text-amber-400 font-medium">Welcome back</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Hello, {user?.username}! 👋
                    </h1>
                    <p className="text-slate-400 mb-6 max-w-xl">
                        Here's what's happening with your video processing platform. Monitor your uploads, track processing status, and manage your content.
                    </p>
                    {canUpload && (
                        <Link to="/upload" className="btn-primary inline-flex">
                            <Upload className="w-4 h-4" />
                            Upload New Video
                        </Link>
                    )}
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="stat-card group"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />

                            <div className="relative flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <TrendingUp className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="relative">
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-sm text-slate-400">{stat.title}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Storage & Activity Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Storage Card */}
                <div className="lg:col-span-1 card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                            <HardDrive className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Storage Used</h3>
                            <p className="text-xs text-slate-500">Total video storage</p>
                        </div>
                    </div>

                    <p className="text-2xl font-bold text-white mb-3">
                        {formatFileSize(stats?.totalSize || 0)}
                    </p>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.min((stats?.totalSize || 0) / (1024 * 1024 * 1024) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">1 GB limit</p>
                </div>

                {/* Quick Stats */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Processing Overview</h3>
                                <p className="text-xs text-slate-500">Status breakdown</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                <span className="text-xs text-slate-400">Uploaded</span>
                            </div>
                            <p className="text-xl font-bold text-white">{stats?.statusCounts?.uploaded || 0}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs text-slate-400">Completed</span>
                            </div>
                            <p className="text-xl font-bold text-white">{(stats?.statusCounts?.safe || 0) + (stats?.statusCounts?.processed || 0)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                <span className="text-xs text-slate-400">Errors</span>
                            </div>
                            <p className="text-xl font-bold text-white">{stats?.statusCounts?.error || 0}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Recent Videos */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Recent Videos</h2>
                            <p className="text-xs text-slate-500">Your latest uploads</p>
                        </div>
                    </div>
                    <Link
                        to="/videos"
                        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        View all
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <VideoCardSkeleton />
                        <VideoCardSkeleton />
                        <VideoCardSkeleton />
                        <VideoCardSkeleton />
                    </div>
                ) : recentVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentVideos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state card">
                        <div className="empty-icon">
                            <Video className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-300 mb-2">No videos yet</h3>
                        <p className="text-sm text-slate-500 mb-4">Upload your first video to get started</p>
                        {canUpload && (
                            <Link to="/upload" className="btn-primary">
                                <Upload className="w-4 h-4" />
                                Upload Video
                            </Link>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
