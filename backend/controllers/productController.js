import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const { category, search, sort, tag } = req.query;

        // Build query
        let query = {};

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tag = tag;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Build sort
        let sortOption = {};
        switch (sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'rating_desc':
                sortOption = { rating: -1 };
                break;
            case 'name_asc':
                sortOption = { name: 1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortOption);

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate(
            'category',
            'name slug'
        );

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const { name, price, category, stock, rating, image, tag, description } =
            req.body;

        const product = await Product.create({
            name,
            price,
            category,
            stock,
            rating: rating || 0,
            image: image || '📦',
            tag: tag || '',
            description: description || '',
        });

        const populatedProduct = await Product.findById(product._id).populate(
            'category',
            'name slug'
        );

        res.status(201).json(populatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const { name, price, category, stock, rating, image, tag, description } =
            req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name ?? product.name;
            product.price = price ?? product.price;
            product.category = category ?? product.category;
            product.stock = stock ?? product.stock;
            product.rating = rating ?? product.rating;
            product.image = image ?? product.image;
            product.tag = tag ?? product.tag;
            product.description = description ?? product.description;

            const updatedProduct = await product.save();
            const populatedProduct = await Product.findById(updatedProduct._id).populate(
                'category',
                'name slug'
            );

            res.json(populatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
