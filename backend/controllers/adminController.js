import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        // Total counts
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Revenue
        const orders = await Order.find({});
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        // Recent orders
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            recentOrders,
            ordersByStatus,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sales analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
    try {
        // Best selling products
        const bestSelling = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: {
                        $sum: { $multiply: ['$items.price', '$items.quantity'] },
                    },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
        ]);

        // Monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);

        // Low stock products
        const lowStock = await Product.find({ stock: { $lte: 5 } })
            .select('name stock image')
            .sort({ stock: 1 })
            .limit(10);

        res.json({
            bestSelling,
            monthlyRevenue,
            lowStock,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;

        if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
