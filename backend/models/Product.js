const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    originalPrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    images: [{ url: String, public_id: String }],
    category: { type: String, required: [true, 'Category is required'] },
    subcategory: { type: String, default: '' },
    brand: { type: String, default: '' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    tags: [String],
    sizes: [String],
    colors: [String],
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    numReviews: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  if (typeof next === 'function') next();
});

productSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating =
      this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
