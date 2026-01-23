import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
    FiHome,
    FiVideo,
    FiUsers,
    FiLogOut,
    FiMenu,
    FiX,
    FiUpload,
    FiUser,
    FiWifi,
    FiWifiOff,
    FiGrid,
    FiSettings,
    FiHelpCircle
} from 'react-icons/fi';
import { getRoleClass, getInitials, stringToColor } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout, canUpload, canManageUsers } = useAuth();
    const { connected } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
        { to: '/videos', label: 'Video Library', icon: FiVideo },
    ];

    if (canManageUsers) {
        navLinks.push({ to: '/admin', label: 'Admin Panel', icon: FiUsers });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Horizontal Top Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Mobile Menu Toggle */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                            >
                                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                            </button>
                            <Link to="/dashboard" className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <FiVideo className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold gradient-text hidden sm:block tracking-tight text-white">
                                    VideoStream
                                </span>
                            </Link>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-4">
                            {/* Connection status */}
                            <div
                                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold border transition-colors ${connected
                                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/5 text-red-400 border-red-500/20'
                                    }`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                {connected ? 'Live Sync' : 'Reconnecting'}
                            </div>

                            {/* Upload button */}
                            {canUpload && (
                                <Link
                                    to="/upload"
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                                >
                                    <FiUpload className="w-4 h-4" />
                                    <span>Upload</span>
                                </Link>
                            )}

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800/50 transition-colors"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner"
                                        style={{ backgroundColor: stringToColor(user?.username || 'User') }}
                                    >
                                        {getInitials(user?.username)}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute right-0 mt-3 w-64 glass-card-strong z-20 py-2 shadow-2xl overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-800/50">
                                                    <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                                    <span className={`mt-2 block w-fit ${getRoleClass(user?.role)}`}>
                                                        {user?.role}
                                                    </span>
                                                </div>
                                                <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors">
                                                    <FiUser className="w-4 h-4" /> Profile Settings
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors text-left"
                                                >
                                                    <FiLogOut className="w-4 h-4" /> Sign Out
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Side Sidebar (Desktop) */}
            <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-slate-800/50 bg-slate-950/50 backdrop-blur-sm hidden lg:flex flex-col p-4 z-40">
                <div className="space-y-1 mb-auto">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive(link.to)
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                                }`}
                        >
                            <link.icon className={`w-5 h-5 transition-colors ${isActive(link.to) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-800/50 space-y-1">
                    <Link to="/help" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-800/50 hover:text-white transition-all">
                        <FiHelpCircle className="w-5 h-5" /> Help & Feedback
                    </Link>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-[70] lg:hidden flex flex-col p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                                        <FiVideo className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-white">VideoStream</span>
                                </Link>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-2 flex-grow">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-md font-medium transition-all ${isActive(link.to)
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                            }`}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                ))}
                                {canUpload && (
                                    <Link
                                        to="/upload"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="mt-4 flex items-center gap-4 px-4 py-3.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700"
                                    >
                                        <FiUpload className="w-5 h-5 text-indigo-400" />
                                        Upload New
                                    </Link>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                        {getInitials(user?.username)}
                                    </div>
                                    <div className="flex flex-col truncate">
                                        <span className="text-sm font-semibold text-white">{user?.username}</span>
                                        <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <FiLogOut className="w-5 h-5" /> Sign Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Spacer for Top Nav */}
            <div className="h-16" />
        </>
    );
};

export default Navbar;
