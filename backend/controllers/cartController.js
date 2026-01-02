import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items.product',
            select: 'name price stock image category',
            populate: { path: 'category', select: 'name' },
        });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [{ product: productId, quantity }],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                // Item exists, update quantity
                const newQty = cart.items[itemIndex].quantity + quantity;
                if (newQty > product.stock) {
                    return res.status(400).json({ message: 'Not enough stock' });
                }
                cart.items[itemIndex].quantity = newQty;
            } else {
                // Add new item
                cart.items.push({ product: productId, quantity });
            }

            await cart.save();
        }

        // Return populated cart
        cart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name price stock image category',
            populate: { path: 'category', select: 'name' },
        });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not in cart' });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        cart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name price stock image category',
            populate: { path: 'category', select: 'name' },
        });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== req.params.productId
        );

        await cart.save();

        cart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name price stock image category',
            populate: { path: 'category', select: 'name' },
        });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.json({ message: 'Cart cleared', items: [] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
