import express from 'express';
import {
    getMyOrders,
    getOrderById,
    createOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All order routes are private
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);

export default router;
