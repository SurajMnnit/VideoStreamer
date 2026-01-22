import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { videoAPI } from '../api';
import { useSocket } from '../context/SocketContext';
import VideoCard from '../components/VideoCard';
import { VideoCardSkeleton } from '../components/Skeleton';
import {
    Search,
    Filter,
    Grid3X3,
    List,
    Video,
    Upload,
    Clock,
    CheckCircle,
    AlertTriangle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const statusFilters = [
    { value: '', label: 'All Videos', icon: Video, color: 'text-slate-400' },
    { value: 'uploaded', label: 'Uploaded', icon: Upload, color: 'text-blue-400' },
    { value: 'processing', label: 'Processing', icon: Clock, color: 'text-amber-400' },
    { value: 'safe', label: 'Safe', icon: CheckCircle, color: 'text-emerald-400' },
    { value: 'flagged', label: 'Flagged', icon: AlertTriangle, color: 'text-red-400' },
    { value: 'error', label: 'Error', icon: XCircle, color: 'text-red-400' },
];

const Videos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [viewMode, setViewMode] = useState('grid');
    const { videoProgress } = useSocket();
    const { canUpload } = useAuth();

    useEffect(() => {
        fetchVideos();
    }, [status, page]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 12 };
            if (status) params.status = status;
            if (search) params.search = search;

            const res = await videoAPI.getAll(params);
            setVideos(res.data.videos);
            setTotalPages(res.data.pages);
            setTotal(res.data.total);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchVideos();
    };

    // Update videos when progress updates come in
    useEffect(() => {
        if (videoProgress) {
            setVideos(prev =>
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

    const activeFilter = statusFilters.find(f => f.value === status);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Video Library</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {total} video{total !== 1 ? 's' : ''} in your library
                    </p>
                </div>
                {canUpload && (
                    <Link to="/upload" className="btn-primary">
                        <Upload className="w-4 h-4" />
                        Upload Video
                    </Link>
                )}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                    {statusFilters.map((filter) => {
                        const Icon = filter.icon;
                        const isActive = status === filter.value;
                        return (
                            <motion.button
                                key={filter.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setStatus(filter.value); setPage(1); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-200'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? filter.color : ''}`} />
                                {filter.label}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Search & View Toggle */}
                <div className="flex gap-3 ml-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search videos..."
                            className="input pl-10 w-64"
                        />
                    </div>

                    <div className="flex border border-slate-700/50 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            {loading ? (
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <VideoCardSkeleton key={i} />
                    ))}
                </div>
            ) : videos.length > 0 ? (
                <div
                    className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
                >
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="empty-state card">
                    <div className="empty-icon">
                        <Video className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300 mb-2">
                        {status ? `No ${activeFilter?.label.toLowerCase()} videos` : 'No videos found'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        {status ? 'Try changing the filter' : 'Upload your first video to get started'}
                    </p>
                    {canUpload && !status && (
                        <Link to="/upload" className="btn-primary">
                            <Upload className="w-4 h-4" />
                            Upload Video
                        </Link>
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-icon disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </motion.button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .map((p, idx, arr) => (
                                <span key={p}>
                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                        <span className="px-2 text-slate-500">...</span>
                                    )}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${page === p
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                            }`}
                                    >
                                        {p}
                                    </motion.button>
                                </span>
                            ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="btn-icon disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};

export default Videos;
