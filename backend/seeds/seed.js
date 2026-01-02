import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

const users = [
    {
        name: 'Admin User',
        email: 'admin@yucommerce.com',
        password: 'admin123',
        role: 'admin',
    },
    {
        name: 'Test User',
        email: 'user@yucommerce.com',
        password: 'user123',
        role: 'user',
    },
];

const categories = [
    { name: 'Electronics' },
    { name: 'Fashion' },
    { name: 'Lifestyle' },
];

const productsData = [
    {
        name: 'Premium Wireless Headphones',
        price: 299,
        categoryName: 'Electronics',
        rating: 4.8,
        image: 'https://cdn.akakce.com/apple/airpods-max-uzay-grisi-mgyh3tu-a-kablosuz-kulak-ustu-z.jpg',
        tag: 'Bestseller',
        stock: 12,
    },
    {
        name: 'Designer Leather Bag',
        price: 449,
        categoryName: 'Fashion',
        rating: 4.9,
        image: 'https://affordableluxurys.com/cdn/shop/articles/fashion-alert-chanel-price-increase-march-2024-864093.jpg',
        tag: 'New',
        stock: 7,
    },
    {
        name: 'Smart Fitness Watch',
        price: 199,
        categoryName: 'Electronics',
        rating: 4.7,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6DUxq5Kaz8KSM4Ov1LJ1pvgG-4u28KkKc9A&s',
        tag: 'Hot',
        stock: 18,
    },
    {
        name: 'Minimalist Sneakers',
        price: 129,
        categoryName: 'Fashion',
        rating: 4.6,
        image: 'https://img.sportinn.com.tr/nike-air-force-1-07-erkek-sneaker-ayakkabi-cw2288-111-153736-43-B.jpg',
        tag: 'Sale',
        stock: 22,
    },
    {
        name: 'Portable Bluetooth Speaker',
        price: 89,
        categoryName: 'Electronics',
        rating: 4.5,
        image: 'https://sharafstore.com/web/image/product.product/9246/image_1024/%5BJBL256%5D%20JBL%20Charge%205%20Portable%20Wireless%20Bluetooth%20Speaker%20%28Color:%20Black%29?unique=6356347',
        tag: 'Hot',
        stock: 30,
    },
    {
        name: 'Classic Sunglasses',
        price: 179,
        categoryName: 'Fashion',
        rating: 4.8,
        image: 'https://productimages.hepsiburada.net/s/20/375-375/9882461372466.jpg',
        tag: 'New',
        stock: 15,
    },
    {
        name: 'Aroma Candle Set',
        price: 59,
        categoryName: 'Lifestyle',
        rating: 4.6,
        image: 'https://5.imimg.com/data5/SELLER/Default/2024/10/455970455/IR/GC/KO/85240456/mercury-glass-scented-candle-500x500.jpeg',
        tag: 'New',
        stock: 40,
    },
    {
        name: 'Minimal Desk Lamp',
        price: 119,
        categoryName: 'Lifestyle',
        rating: 4.7,
        image: 'https://image-ikea.mncdn.com/ozgur-icerik/kategori/calisma-masasi-lambalari/skurup-calisma-lambasi.jpg',
        tag: 'Hot',
        stock: 16,
    },
    {
        name: 'Noise Cancelling Earbuds',
        price: 159,
        categoryName: 'Electronics',
        rating: 4.6,
        image: 'https://st-troy.mncdn.com/mnresize/775/775/Content/media/ProductImg/original/mtjv3tua-airpods-pro-2-nesil-ve-magsafe-sarj-kutusu-usb-c-638320993924315667.jpeg',
        tag: 'Sale',
        stock: 25,
    },
    {
        name: 'Everyday Hoodie',
        price: 99,
        categoryName: 'Fashion',
        rating: 4.5,
        image: 'https://cdn.myikas.com/images/1fb67cff-54d2-4340-99ff-a69f1e99cfd0/c1c5f071-2bf4-4606-845c-15d101d11c9c/1080/ss25-hoodie-ipsiz-custom-view-6.webp',
        tag: 'Bestseller',
        stock: 33,
    },
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Data cleared');

        // Create users
        const createdUsers = await User.create(users);
        console.log(`${createdUsers.length} users created`);

        // Create categories
        const createdCategories = await Category.create(categories);
        console.log(`${createdCategories.length} categories created`);

        // Create category map for products
        const categoryMap = {};
        createdCategories.forEach((cat) => {
            categoryMap[cat.name] = cat._id;
        });

        // Create products with category references
        const products = productsData.map((p) => ({
            name: p.name,
            price: p.price,
            category: categoryMap[p.categoryName],
            rating: p.rating,
            image: p.image,
            tag: p.tag,
            stock: p.stock,
            description: `A premium ${p.categoryName.toLowerCase()} item designed for comfort and style.`,
        }));

        const createdProducts = await Product.create(products);
        console.log(`${createdProducts.length} products created`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\nDemo Accounts:');
        console.log('  Admin: admin@yucommerce.com / admin123');
        console.log('  User:  user@yucommerce.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
