import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Private routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin routes
router.get('/', protect, admin, getUsers);
router.delete('/:id', protect, admin, deleteUser);

export default router;
