import User from '../models/User.js';
import Video from '../models/Video.js';
import { ApiError, asyncHandler } from '../middlewares/errorHandler.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin only)
export const getUsers = asyncHandler(async (req, res) => {
    const { search, role, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role && ['viewer', 'editor', 'admin'].includes(role)) {
        query.role = role;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
        User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        User.countDocuments(query)
    ]);

    // Get video counts for each user
    const userIds = users.map(u => u._id);
    const videoCounts = await Video.aggregate([
        { $match: { owner: { $in: userIds } } },
        { $group: { _id: '$owner', count: { $sum: 1 } } }
    ]);

    const videoCountMap = {};
    videoCounts.forEach(vc => {
        videoCountMap[vc._id.toString()] = vc.count;
    });

    const usersWithCounts = users.map(u => ({
        ...u,
        videoCount: videoCountMap[u._id.toString()] || 0
    }));

    res.status(200).json({
        success: true,
        count: users.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        users: usersWithCounts
    });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin only)
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const videoCount = await Video.countDocuments({ owner: user._id });

    res.status(200).json({
        success: true,
        user: {
            ...user.toObject(),
            videoCount
        }
    });
});

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (admin only)
export const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!role || !['viewer', 'editor', 'admin'].includes(role)) {
        throw new ApiError(400, 'Please provide a valid role (viewer, editor, admin)');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user.id && role !== 'admin') {
        throw new ApiError(400, 'Cannot demote yourself');
    }

    user.role = role;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        user
    });
});

// @desc    Toggle user active status
// @route   PUT /api/users/:id/status
// @access  Private (admin only)
export const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user.id) {
        throw new ApiError(400, 'Cannot deactivate yourself');
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        user
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin only)
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
        throw new ApiError(400, 'Cannot delete yourself');
    }

    // Delete user's videos
    await Video.deleteMany({ owner: user._id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'User and associated videos deleted successfully'
    });
});

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private (admin only)
export const getUserStats = asyncHandler(async (req, res) => {
    const [totalUsers, roleStats, recentUsers] = await Promise.all([
        User.countDocuments(),
        User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username email role createdAt')
            .lean()
    ]);

    const roleCounts = {
        viewer: 0,
        editor: 0,
        admin: 0
    };

    roleStats.forEach(rs => {
        roleCounts[rs._id] = rs.count;
    });

    res.status(200).json({
        success: true,
        stats: {
            totalUsers,
            roleCounts,
            recentUsers
        }
    });
});
