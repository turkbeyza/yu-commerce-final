import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email'
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Make sure user owns the order or is admin
        if (
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, couponCode } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user._id }).populate(
            'items.product'
        );

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate prices
        let subtotal = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.product;

            // Check stock
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name}`,
                });
            }

            subtotal += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image,
            });

            // Reduce stock
            await Product.findByIdAndUpdate(product._id, {
                $inc: { stock: -item.quantity },
            });
        }

        // Calculate discount
        let discount = 0;
        const code = (couponCode || '').toUpperCase();
        if (code === 'YU10') {
            discount = Math.round(subtotal * 0.1);
        } else if (code === 'FREESHIP') {
            discount = Math.min(15, subtotal);
        }

        const total = Math.max(0, subtotal - discount);

        // Create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'Credit Card',
            subtotal,
            discount,
            total,
            status: 'pending',
            paidAt: new Date(),
        });

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
