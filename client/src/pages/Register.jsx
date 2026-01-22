import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Video, Shield } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'viewer'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const result = await register(
            formData.username,
            formData.email,
            formData.password,
            formData.role
        );

        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex gradient-mesh">
            {/* Left side - Form */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex items-center justify-center p-8"
            >
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">VideoStream</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-slate-400 mb-8">Get started with your free account</p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="input-icon" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Choose a username"
                                        className="input pl-12"
                                        minLength={3}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="input pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        className="input pl-12 pr-12"
                                        minLength={6}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        className="input pl-12"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Account Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    Account Type
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, role: 'viewer' })}
                                        className={`p-4 rounded-xl border transition-all duration-200 text-left ${formData.role === 'viewer'
                                                ? 'border-indigo-500/50 bg-indigo-500/10'
                                                : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
                                            }`}
                                    >
                                        <Video className={`w-5 h-5 mb-2 ${formData.role === 'viewer' ? 'text-indigo-400' : 'text-slate-400'}`} />
                                        <span className={`text-sm font-medium block ${formData.role === 'viewer' ? 'text-indigo-400' : 'text-slate-300'}`}>
                                            Viewer
                                        </span>
                                        <p className="text-xs text-slate-500 mt-1">View & stream videos</p>
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, role: 'editor' })}
                                        className={`p-4 rounded-xl border transition-all duration-200 text-left ${formData.role === 'editor'
                                                ? 'border-indigo-500/50 bg-indigo-500/10'
                                                : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
                                            }`}
                                    >
                                        <Shield className={`w-5 h-5 mb-2 ${formData.role === 'editor' ? 'text-indigo-400' : 'text-slate-400'}`} />
                                        <span className={`text-sm font-medium block ${formData.role === 'editor' ? 'text-indigo-400' : 'text-slate-300'}`}>
                                            Editor
                                        </span>
                                        <p className="text-xs text-slate-500 mt-1">Upload & manage videos</p>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary w-full py-3.5 text-base mt-6"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <p className="text-center mt-8 text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right side - Decorative */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 relative"
            >
                <div className="max-w-md text-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="relative w-32 h-32 mx-auto mb-8"
                    >
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 animate-pulse opacity-30 blur-2xl" />
                        <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-2xl">
                            <User className="w-16 h-16 text-white" />
                        </div>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mb-4"
                    >
                        Join VideoStream
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-slate-400"
                    >
                        Start uploading, processing, and streaming your video content with our AI-powered platform.
                    </motion.p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/3 right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            </motion.div>
        </div>
    );
};

export default Register;
