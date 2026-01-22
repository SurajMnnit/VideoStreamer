import express from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/me', updateProfile);
router.put('/password', changePassword);
router.post('/logout', logout);

export default router;
