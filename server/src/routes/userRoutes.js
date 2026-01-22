import express from 'express';
import {
    getUsers,
    getUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    getUserStats
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getUserStats);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
