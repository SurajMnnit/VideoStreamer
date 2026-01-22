import { useState, useEffect, useCallback } from 'react';
import { videoAPI } from '../api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export const useVideos = (initialFilters = {}) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
    });
    const [filters, setFilters] = useState(initialFilters);
    const { videoProgress } = useSocket();

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await videoAPI.getAll({
                ...filters,
                page: pagination.page,
            });
            setVideos(response.data.videos);
            setPagination({
                page: response.data.page,
                pages: response.data.pages,
                total: response.data.total,
            });
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch videos';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Update videos when real-time progress comes in
    useEffect(() => {
        if (Object.keys(videoProgress).length > 0) {
            setVideos((prevVideos) =>
                prevVideos.map((video) => {
                    const progress = videoProgress[video._id];
                    if (progress) {
                        return {
                            ...video,
                            status: progress.status,
                            processingProgress: progress.progress,
                            sensitivityScore: progress.sensitivityScore,
                        };
                    }
                    return video;
                })
            );
        }
    }, [videoProgress]);

    const updateFilters = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const changePage = (page) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const refreshVideos = () => {
        fetchVideos();
    };

    return {
        videos,
        loading,
        error,
        pagination,
        filters,
        updateFilters,
        changePage,
        refreshVideos,
    };
};

export default useVideos;
