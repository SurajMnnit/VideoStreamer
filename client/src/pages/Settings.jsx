import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import {
    User,
    Mail,
    Shield,
    Bell,
    Palette,
    Save,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        username: '',
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.updateProfile(profileData);
            if (response.data.success) {
                updateUser(response.data.user);
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (passwordData.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            const response = await authAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (response.data.success) {
                toast.success('Password updated successfully');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update password';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, staggerChildren: 0.1 }
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'security', label: 'Password & Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette }
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-8 pb-12">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
                <p className="text-slate-400">Manage your profile information and security preferences.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Tabs Sidebar */}
                <div className="md:col-span-4 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Profile Information</h2>
                                        <p className="text-sm text-slate-400 mt-1">Update your basic account details.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="space-y-2 group">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                                        <div className="input-group">
                                            <User className="input-icon" />
                                            <input
                                                type="text"
                                                className="input pl-12"
                                                value={profileData.username}
                                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                        <div className="input-group">
                                            <Mail className="input-icon" />
                                            <input
                                                type="email"
                                                className="input pl-12"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-4">
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="w-4 h-4" />
                                                Save Profile Changes
                                            </span>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Change Password</h2>
                                        <p className="text-sm text-slate-400 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="space-y-2 group">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Current Password</label>
                                        <div className="input-group">
                                            <Lock className="input-icon" />
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                className="input pl-12"
                                                placeholder="••••••••"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                required
                                            />
                                            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 group">
                                            <label className="text-sm font-medium text-slate-300 ml-1">New Password</label>
                                            <div className="input-group">
                                                <Lock className="input-icon" />
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="input pl-12"
                                                    placeholder="••••••••"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    required
                                                />
                                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="text-sm font-medium text-slate-300 ml-1">Confirm New Password</label>
                                            <div className="input-group">
                                                <Lock className="input-icon" />
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="input pl-12"
                                                    placeholder="••••••••"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-4">
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Update Password
                                            </span>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {(activeTab === 'notifications' || activeTab === 'appearance') && (
                            <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card py-16 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                                    <Bell className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Coming Soon</h3>
                                <p className="text-sm text-slate-500 mt-2">These settings are currently under development.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Settings;
