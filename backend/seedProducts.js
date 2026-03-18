const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');

dotenv.config({ path: './.env' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const categories = [
  { 
    name: 'Electronics', 
    sub: ['Laptops', 'Smartphones', 'Headphones', 'Cameras', 'Smartwatches', 'Speakers'],
    imgKeyword: 'tech'
  },
  { 
    name: 'Clothing', 
    sub: ['T-Shirts', 'Jeans', 'Jackets', 'Shirts', 'Sweaters', 'Trousers'],
    imgKeyword: 'fashion'
  },
  { 
    name: 'Footwear', 
    sub: ['Sneakers', 'Boots', 'Loafers', 'Sandals', 'Running Shoes', 'Formal Shoes'],
    imgKeyword: 'shoes'
  }
];

const adjectives = ['Premium', 'Luxury', 'Essential', 'Modern', 'Classic', 'Ultimate', 'Smart', 'Elegant', 'Durable', 'Lightweight', 'Urban', 'Pro', 'Elite'];
const brands = ['TechPro', 'StyleCo', 'VogueFit', 'ActiveLive', 'Nordic', 'EliteGear', 'Prime'];

const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7);
};

const generateProducts = () => {
  const products = [];
  for (let i = 1; i <= 210; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const sub = cat.sub[Math.floor(Math.random() * cat.sub.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const basePrice = cat.name === 'Electronics' 
      ? Math.floor(Math.random() * 80000) + 5000 
      : Math.floor(Math.random() * 5000) + 500;
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 40) + 10 : 0;
    const price = Math.round(basePrice * (1 - discount / 100));
    const name = `${adj} ${sub} ${i}`;

    products.push({
      name,
      slug: generateSlug(name),
      description: `Elevate your lifestyle with the ${name}. This high-quality product from ${brand} is designed for maximum performance and style. Whether for work or leisure, it delivers reliability you can count on.`,
      shortDescription: `A premium ${sub.toLowerCase()} for discerning users.`,
      price: price,
      originalPrice: discount > 0 ? basePrice : undefined,
      discount: discount,
      category: cat.name,
      subcategory: sub,
      brand: brand,
      stock: Math.floor(Math.random() * 100) + 10,
      isFeatured: Math.random() > 0.85,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      numReviews: Math.floor(Math.random() * 300) + 10,
      // Using LoremFlickr for reliable category-specific images
      images: [{ url: `https://loremflickr.com/800/800/${cat.imgKeyword}?lock=${i}` }],
      isActive: true,
      colors: ['Black', 'White', 'Midnight', 'Slate'],
      sizes: cat.name === 'Electronics' ? [] : ['S', 'M', 'L', 'XL', 'XXL', '10', '11', '12']
    });
  }
  return products;
};

const seedData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log('Old products cleared');
    const products = generateProducts();
    await Product.insertMany(products);
    console.log('200+ Products seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
