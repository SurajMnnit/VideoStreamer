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
} from 'react-icons/fi';
import { useState } from 'react';
import { getRoleClass, getInitials, stringToColor } from '../utils/helpers';

const Navbar = () => {
    const { user, logout, canUpload, canManageUsers } = useAuth();
    const { connected } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: FiHome },
        { to: '/videos', label: 'Videos', icon: FiVideo },
    ];

    if (canManageUsers) {
        navLinks.push({ to: '/admin', label: 'Admin', icon: FiUsers });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <FiVideo className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">
                            VideoStream
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.to)
                                        ? 'bg-primary-500/20 text-primary-400'
                                        : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-4">
                        {/* Connection status */}
                        <div
                            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${connected
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                        >
                            {connected ? (
                                <>
                                    <FiWifi className="w-3 h-3" />
                                    <span>Live</span>
                                </>
                            ) : (
                                <>
                                    <FiWifiOff className="w-3 h-3" />
                                    <span>Offline</span>
                                </>
                            )}
                        </div>

                        {/* Upload button */}
                        {canUpload && (
                            <Link
                                to="/upload"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                            >
                                <FiUpload className="w-4 h-4" />
                                Upload
                            </Link>
                        )}

                        {/* User menu */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-dark-100">
                                    {user?.username}
                                </span>
                                <span className={`text-xs ${getRoleClass(user?.role)}`}>
                                    {user?.role}
                                </span>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                style={{ backgroundColor: stringToColor(user?.username || 'User') }}
                            >
                                {getInitials(user?.username)}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                title="Logout"
                            >
                                <FiLogOut className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-dark-300 hover:text-dark-100 hover:bg-dark-800 rounded-lg"
                        >
                            {mobileMenuOpen ? (
                                <FiX className="w-6 h-6" />
                            ) : (
                                <FiMenu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-dark-700/50">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.to)
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'
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
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium"
                                >
                                    <FiUpload className="w-5 h-5" />
                                    Upload Video
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
