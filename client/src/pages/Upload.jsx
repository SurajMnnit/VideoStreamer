import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { videoAPI } from '../api';
import toast from 'react-hot-toast';
import {
    Upload as UploadIcon,
    Film,
    X,
    Check,
    ArrowRight,
    FileVideo,
    Cloud,
    Zap,
    Shield,
    Sparkles
} from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith('video/')) {
                setFile(droppedFile);
                if (!title) {
                    setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
                }
            } else {
                toast.error('Please drop a valid video file');
            }
        }
    }, [title]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!title) {
                setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const removeFile = () => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            toast.error('Please select a video file');
            return;
        }

        if (!title.trim()) {
            toast.error('Please enter a video title');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            await videoAPI.upload(file, title, description, tags, (progress) => {
                setUploadProgress(progress);
            });

            toast.success('Video uploaded successfully! Processing will begin shortly.');
            navigate('/videos');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const features = [
        { icon: Zap, title: 'Fast Processing', desc: 'AI-powered analysis' },
        { icon: Shield, title: 'Secure Storage', desc: 'Encrypted uploads' },
        { icon: Sparkles, title: 'Smart Detection', desc: 'Content moderation' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/25"
                >
                    <Cloud className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
                <p className="text-slate-400">Upload your video for AI-powered sensitivity analysis</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${dragActive
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : file
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <AnimatePresence mode="wait">
                        {file ? (
                            <motion.div
                                key="file"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="p-8"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
                                        <FileVideo className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-semibold text-white truncate">{file.name}</p>
                                        <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Check className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm text-emerald-400">Ready to upload</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors z-20 relative"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="py-16 px-8 text-center"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-6">
                                    <UploadIcon className={`w-10 h-10 transition-colors ${dragActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {dragActive ? 'Drop your video here' : 'Drag & drop your video'}
                                </h3>
                                <p className="text-slate-400 mb-6">
                                    or click to browse from your computer
                                </p>
                                <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                                    <span>MP4, WebM, MOV, AVI</span>
                                    <span>•</span>
                                    <span>Up to 100MB</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Upload Progress */}
                <AnimatePresence>
                    {uploading && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="card"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-slate-300">Uploading...</span>
                                <span className="text-sm font-bold text-indigo-400">{uploadProgress}%</span>
                            </div>
                            <div className="progress-bar">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Video Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card space-y-5"
                >
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-indigo-400" />
                        Video Details
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter video title"
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter video description (optional)"
                                rows={3}
                                className="input resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Enter tags separated by commas"
                                className="input"
                            />
                            <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                        </div>
                    </div>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {features.map((feature, i) => (
                        <div key={feature.title} className="card text-center">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                                <feature.icon className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h4 className="text-sm font-medium text-white mb-1">{feature.title}</h4>
                            <p className="text-xs text-slate-500">{feature.desc}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={!file || !title.trim() || uploading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full py-4 text-base"
                >
                    {uploading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <UploadIcon className="w-5 h-5" />
                            Upload & Process Video
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default Upload;
