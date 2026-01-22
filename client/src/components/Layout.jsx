import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
    LayoutDashboard,
    Video,
    Upload,
    Users,
    LogOut,
    Menu,
    X,
    Wifi,
    WifiOff,
    ChevronDown,
    Settings,
    User,
    Zap
} from 'lucide-react';
import { getRoleClass, getInitials, stringToColor } from '../utils/helpers';

const Layout = () => {
    const { user, logout, canUpload, canManageUsers } = useAuth();
    const { connected } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/videos', label: 'Video Library', icon: Video },
    ];

    if (canUpload) {
        navLinks.push({ to: '/upload', label: 'Upload', icon: Upload });
    }

    if (canManageUsers) {
        navLinks.push({ to: '/admin', label: 'Admin Panel', icon: Users });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Animated Background */}
            <div className="fixed inset-0 gradient-mesh pointer-events-none" />

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="sidebar"
                    >
                        {/* Logo */}
                        <div className="p-6 border-b border-slate-800/50">
                            <Link to="/dashboard" className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">VideoStream</h1>
                                    <p className="text-xs text-slate-500">Processing Platform</p>
                                </div>
                            </Link>
                        </div>

                        {/* User Info */}
                        <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                                    style={{ backgroundColor: stringToColor(user?.username || 'User') }}
                                >
                                    {getInitials(user?.username)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-100 truncate">{user?.username}</p>
                                    <span className={`text-xs ${getRoleClass(user?.role)}`}>{user?.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1">
                            <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`sidebar-link ${isActive(link.to) ? 'active' : ''}`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Connection Status */}
                        <div className="p-4 border-t border-slate-800/50">
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${connected ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
                                }`}>
                                {connected ? (
                                    <>
                                        <div className="relative">
                                            <Wifi className="w-4 h-4 text-emerald-400" />
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-emerald-400">Connected</p>
                                            <p className="text-xs text-emerald-400/60">Real-time updates active</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-4 h-4 text-red-400" />
                                        <div>
                                            <p className="text-xs font-medium text-red-400">Disconnected</p>
                                            <p className="text-xs text-red-400/60">Reconnecting...</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="p-4 border-t border-slate-800/50">
                            <button
                                onClick={handleLogout}
                                className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-400"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden btn-icon"
            >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Main Content */}
            <main className={`relative min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 glass-strong border-b border-slate-800/50">
                    <div className="flex items-center justify-between h-16 px-6">
                        <div className="flex items-center gap-4">
                            {!sidebarOpen && (
                                <button onClick={() => setSidebarOpen(true)} className="btn-icon">
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}
                            <div>
                                <h2 className="text-lg font-semibold text-slate-100">
                                    {navLinks.find(l => isActive(l.to))?.label || 'Dashboard'}
                                </h2>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {canUpload && !isActive('/upload') && (
                                <Link to="/upload" className="btn-primary text-sm">
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </Link>
                            )}

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-colors"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{ backgroundColor: stringToColor(user?.username || 'User') }}
                                    >
                                        {getInitials(user?.username)}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="dropdown open"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-700/50">
                                                <p className="text-sm font-medium text-slate-100">{user?.username}</p>
                                                <p className="text-xs text-slate-500">{user?.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <button className="dropdown-item w-full">
                                                    <User className="w-4 h-4" />
                                                    Profile
                                                </button>
                                                <button className="dropdown-item w-full">
                                                    <Settings className="w-4 h-4" />
                                                    Settings
                                                </button>
                                            </div>
                                            <div className="border-t border-slate-700/50 pt-2">
                                                <button onClick={handleLogout} className="dropdown-item w-full text-red-400">
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
