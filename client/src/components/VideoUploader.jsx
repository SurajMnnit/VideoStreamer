import { useState, useRef, useCallback } from 'react';
import { FiUploadCloud, FiX, FiFile, FiCheck } from 'react-icons/fi';
import { formatFileSize } from '../utils/helpers';

const VideoUploader = ({ onUpload, uploading, uploadProgress }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    const validateFile = (file) => {
        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Please upload MP4, WebM, MOV, or AVI files.';
        }
        if (file.size > maxSize) {
            return 'File too large. Maximum size is 100MB.';
        }
        return null;
    };

    const handleFile = (selectedFile) => {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setFile(selectedFile);
        // Auto-fill title from filename
        if (!title) {
            const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
            setTitle(fileName);
        }
    };

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
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title.trim()) {
            setError('Please select a video and provide a title');
            return;
        }

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('tags', tags.trim());

        await onUpload(formData);
    };

    const removeFile = () => {
        setFile(null);
        setError('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dropzone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${dragActive
                        ? 'border-primary-500 bg-primary-500/10'
                        : file
                            ? 'border-emerald-500/50 bg-emerald-500/5'
                            : 'border-dark-600 hover:border-dark-500 bg-dark-800/50'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />

                <div className="p-8 text-center">
                    {file ? (
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <FiCheck className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-dark-100">{file.name}</p>
                                <p className="text-sm text-dark-400">{formatFileSize(file.size)}</p>
                            </div>
                            {!uploading && (
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                                >
                                    <FiX className="w-4 h-4" />
                                    Remove
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-primary-500/20 flex items-center justify-center">
                                <FiUploadCloud className="w-8 h-8 text-primary-400" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-dark-100">
                                    Drop your video here, or{' '}
                                    <span className="text-primary-400">browse</span>
                                </p>
                                <p className="text-sm text-dark-400 mt-1">
                                    Supports MP4, WebM, MOV, AVI up to 100MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload progress bar */}
                {uploading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-700 overflow-hidden rounded-b-2xl">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                        Title <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter video title"
                        className="input"
                        disabled={uploading}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter video description (optional)"
                        rows={3}
                        className="input resize-none"
                        disabled={uploading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                        Tags
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter tags separated by commas"
                        className="input"
                        disabled={uploading}
                    />
                </div>
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={!file || !title.trim() || uploading}
                className="btn-primary w-full"
            >
                {uploading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading... {uploadProgress}%
                    </>
                ) : (
                    <>
                        <FiUploadCloud className="w-5 h-5" />
                        Upload Video
                    </>
                )}
            </button>
        </form>
    );
};

export default VideoUploader;
