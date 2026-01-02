import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes are private
router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update', protect, updateCartItem);
router.delete('/remove/:productId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);

export default router;
