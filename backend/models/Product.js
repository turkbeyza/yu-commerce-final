import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a product name'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
            min: 0,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        image: {
            type: String,
            default: '📦',
        },
        tag: {
            type: String,
            enum: ['Bestseller', 'New', 'Hot', 'Sale', 'Featured', ''],
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
