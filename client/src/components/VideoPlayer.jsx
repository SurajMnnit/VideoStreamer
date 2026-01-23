import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward,
    AlertCircle
} from 'lucide-react';
import { formatDuration } from '../utils/helpers';

const VideoPlayer = ({ src, poster, title }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoverTime, setHoverTime] = useState(null);
    const [hoverPosition, setHoverPosition] = useState(0);

    let hideControlsTimeout;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handleProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };
        const handleLoadStart = () => {
            setLoading(true);
            setError(null);
        };
        const handleCanPlay = () => setLoading(false);
        const handleEnded = () => setPlaying(false);
        const handleWaiting = () => setLoading(true);
        const handlePlaying = () => {
            setLoading(false);
            setPlaying(true);
        };
        const handlePause = () => setPlaying(false);
        const handleError = (e) => {
            console.error('Video error:', e);
            setLoading(false);
            setError('Failed to load video. Please try again.');
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('loadstart', handleLoadStart);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('pause', handlePause);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('loadstart', handleLoadStart);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('error', handleError);
        };
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const togglePlay = async () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            if (playing) {
                video.pause();
            } else {
                await video.play();
            }
        } catch (err) {
            console.error('Play error:', err);
            setError('Failed to play video');
        }
    };

    const toggleMute = () => {
        videoRef.current.muted = !muted;
        setMuted(!muted);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleSeekHover = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        setHoverTime(percent * duration);
        setHoverPosition(e.clientX - rect.left);
    };

    const skip = (seconds) => {
        videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;
    const bufferedProgress = duration ? (buffered / duration) * 100 : 0;

    return (
        <motion.div
            ref={containerRef}
            className="relative w-full h-full bg-black group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => playing && setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
            />

            {/* Error State */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/95"
                    >
                        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                        <p className="text-white text-lg font-medium mb-2">Playback Error</p>
                        <p className="text-slate-400 text-sm">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Spinner */}
            <AnimatePresence>
                {loading && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30"
                    >
                        <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Big Play Button */}
            <AnimatePresence>
                {!playing && !loading && !error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={togglePlay}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-24 h-24 rounded-full bg-indigo-500/90 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-indigo-500/30"
                        >
                            <Play className="w-10 h-10 text-white ml-1" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls Overlay */}
            <AnimatePresence>
                {showControls && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        {/* Gradient Overlays */}
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                        {/* Title */}
                        {title && (
                            <div className="absolute top-4 left-4">
                                <h3 className="text-lg font-semibold text-white drop-shadow-lg">{title}</h3>
                            </div>
                        )}

                        {/* Center Controls */}
                        <div className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-auto">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => skip(-10)}
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <SkipBack className="w-5 h-5 text-white" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                {playing ? (
                                    <Pause className="w-7 h-7 text-white" />
                                ) : (
                                    <Play className="w-7 h-7 text-white ml-1" />
                                )}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => skip(10)}
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                            >
                                <SkipForward className="w-5 h-5 text-white" />
                            </motion.button>
                        </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                            {/* Progress Bar */}
                            <div
                                className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress mb-4"
                                onClick={handleSeek}
                                onMouseMove={handleSeekHover}
                                onMouseLeave={() => setHoverTime(null)}
                            >
                                {/* Buffered */}
                                <div
                                    className="absolute h-full bg-white/30 rounded-full"
                                    style={{ width: `${bufferedProgress}%` }}
                                />
                                {/* Progress */}
                                <motion.div
                                    className="absolute h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                                {/* Hover Preview */}
                                {hoverTime !== null && (
                                    <div
                                        className="absolute -top-10 transform -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-xs text-white"
                                        style={{ left: hoverPosition }}
                                    >
                                        {formatDuration(hoverTime)}
                                    </div>
                                )}
                                {/* Scrubber */}
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                    style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                {/* Left Controls */}
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={togglePlay}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        {playing ? (
                                            <Pause className="w-5 h-5 text-white" />
                                        ) : (
                                            <Play className="w-5 h-5 text-white" />
                                        )}
                                    </motion.button>

                                    {/* Volume */}
                                    <div className="flex items-center gap-2 group/volume">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={toggleMute}
                                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            {muted ? (
                                                <VolumeX className="w-5 h-5 text-white" />
                                            ) : (
                                                <Volume2 className="w-5 h-5 text-white" />
                                            )}
                                        </motion.button>
                                        <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={muted ? 0 : volume}
                                                onChange={handleVolumeChange}
                                                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <span className="text-sm text-white/80 font-medium">
                                        {formatDuration(currentTime)} / {formatDuration(duration)}
                                    </span>
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={toggleFullscreen}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        {fullscreen ? (
                                            <Minimize className="w-5 h-5 text-white" />
                                        ) : (
                                            <Maximize className="w-5 h-5 text-white" />
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VideoPlayer;
