import express from 'express';
import {
    getDashboardStats,
    getAnalytics,
    getAllOrders,
    updateOrderStatus,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require admin role
router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

export default router;
