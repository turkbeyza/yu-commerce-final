import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a category name'],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create slug from name before saving
categorySchema.pre('save', function (next) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
    next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
