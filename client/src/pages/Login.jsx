import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Play, Shield, Sparkles } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);

        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        }
    };

    const features = [
        { icon: Play, title: 'Video Processing', desc: 'AI-powered analysis' },
        { icon: Shield, title: 'Sensitivity Detection', desc: 'Content moderation' },
        { icon: Sparkles, title: 'Real-time Updates', desc: 'Live progress tracking' },
    ];

    return (
        <div className="min-h-screen flex gradient-mesh">
            {/* Left side - Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 relative"
            >
                <div className="max-w-md text-center">
                    {/* Animated Logo */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="relative w-24 h-24 mx-auto mb-8"
                    >
                        <div className="absolute inset-0 rounded-3xl gradient-primary animate-pulse opacity-50 blur-xl" />
                        <div className="relative w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                            <Zap className="w-12 h-12 text-white" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-bold text-white mb-4"
                    >
                        VideoStream
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-slate-400 mb-12"
                    >
                        The ultimate platform for video content management with AI-powered sensitivity analysis.
                    </motion.p>

                    {/* Features */}
                    <div className="space-y-4">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm"
                            >
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-200">{feature.title}</p>
                                    <p className="text-xs text-slate-500">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />
            </motion.div>

            {/* Right side - Form */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex items-center justify-center p-8"
            >
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="lg:hidden flex items-center gap-3 mb-8"
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
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                        <p className="text-slate-400 mb-8">Sign in to continue to your dashboard</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="input-group">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="input-icon" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="input pl-12 pr-12"
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

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary w-full py-3.5 text-base"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <p className="text-center mt-8 text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Sign up
                            </Link>
                        </p>

                        {/* Demo Credentials */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 p-5 rounded-xl glass border border-slate-700/50"
                        >
                            <p className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                Demo Credentials
                            </p>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between p-2 rounded-lg bg-slate-800/30">
                                    <span className="text-violet-400 font-medium">Admin</span>
                                    <span className="text-slate-400">admin@videostream.com / Admin@123</span>
                                </div>
                                <div className="flex justify-between p-2 rounded-lg bg-slate-800/30">
                                    <span className="text-indigo-400 font-medium">Editor</span>
                                    <span className="text-slate-400">editor@videostream.com / Editor@123</span>
                                </div>
                                <div className="flex justify-between p-2 rounded-lg bg-slate-800/30">
                                    <span className="text-slate-400 font-medium">Viewer</span>
                                    <span className="text-slate-400">viewer@videostream.com / Viewer@123</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
