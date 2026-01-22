import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI, videoAPI } from '../api';
import { TableRowSkeleton, StatCardSkeleton } from '../components/Skeleton';
import {
    Users,
    Video,
    Shield,
    Edit3,
    CheckCircle,
    XCircle,
    Trash2,
    Search,
    ChevronDown,
    UserPlus,
    Activity,
    TrendingUp
} from 'lucide-react';
import { formatDate, getInitials, stringToColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const roleConfig = {
    admin: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    editor: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    viewer: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' }
};

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [videoStats, setVideoStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, userStatsRes, videoStatsRes] = await Promise.all([
                userAPI.getAll(),
                userAPI.getStats(),
                videoAPI.getStats()
            ]);

            setUsers(usersRes.data.users);
            setUserStats(userStatsRes.data.stats);
            setVideoStats(videoStatsRes.data.stats);
        } catch (error) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await userAPI.updateRole(userId, newRole);
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
            );
            toast.success('User role updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            const response = await userAPI.toggleStatus(userId);
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, isActive: response.data.user.isActive } : u))
            );
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Delete user "${username}"? This will also delete all their videos.`)) {
            return;
        }

        try {
            await userAPI.delete(userId);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const statCards = [
        {
            title: 'Total Users',
            value: userStats?.totalUsers || 0,
            icon: Users,
            gradient: 'from-blue-500 to-indigo-500'
        },
        {
            title: 'Admins',
            value: userStats?.roleCounts?.admin || 0,
            icon: Shield,
            gradient: 'from-violet-500 to-purple-500'
        },
        {
            title: 'Editors',
            value: userStats?.roleCounts?.editor || 0,
            icon: Edit3,
            gradient: 'from-cyan-500 to-blue-500'
        },
        {
            title: 'Total Videos',
            value: videoStats?.totalVideos || 0,
            icon: Video,
            gradient: 'from-emerald-500 to-green-500'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage users and system settings</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="stat-card group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <TrendingUp className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-sm text-slate-400">{stat.title}</p>
                        </motion.div>
                    ))
                )}
            </div>

            {/* User Management */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card overflow-hidden"
            >
                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">User Management</h2>
                                <p className="text-xs text-slate-500">{filteredUsers.length} users</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="input py-2 w-32"
                            >
                                <option value="">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                            </select>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search users..."
                                    className="input pl-10 py-2 w-48"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-left">
                                <th className="p-4 text-sm font-medium text-slate-400">User</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Role</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Videos</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Joined</th>
                                <th className="p-4 text-sm font-medium text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <>
                                    <TableRowSkeleton />
                                    <TableRowSkeleton />
                                    <TableRowSkeleton />
                                </>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const config = roleConfig[user.role] || roleConfig.viewer;
                                    return (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                                                        style={{ backgroundColor: stringToColor(user.username) }}
                                                    >
                                                        {getInitials(user.username)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{user.username}</p>
                                                        <p className="text-sm text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer appearance-none pr-8 ${config.bg} ${config.border} ${config.color} bg-transparent`}
                                                    >
                                                        <option value="viewer" className="bg-slate-800 text-slate-300">Viewer</option>
                                                        <option value="editor" className="bg-slate-800 text-slate-300">Editor</option>
                                                        <option value="admin" className="bg-slate-800 text-slate-300">Admin</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-slate-400" />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-slate-300">{user.videoCount || 0}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleToggleStatus(user._id)}
                                                        className={`p-2 rounded-lg transition-all duration-200 ${user.isActive
                                                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                            }`}
                                                        title={user.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.isActive ? (
                                                            <XCircle className="w-4 h-4" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteUser(user._id, user.username)}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Admin;
