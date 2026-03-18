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
  { name: 'Electronics', sub: ['Laptops', 'Smartphones', 'Headphones', 'Cameras', 'Tablets'] },
  { name: 'Fashion', sub: ['T-Shirts', 'Jeans', 'Sneakers', 'Watches', 'Handbags'] },
  { name: 'Home & Living', sub: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Lighting'] },
  { name: 'Sports', sub: ['Running', 'Gym', 'Cycling', 'Outdoor', 'Team Sports'] },
  { name: 'Beauty', sub: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Tools'] },
  { name: 'Books', sub: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'Self-Help'] }
];

const adjectives = ['Premium', 'Luxury', 'Essential', 'Modern', 'Classic', 'Ultimate', 'Smart', 'Elegant', 'Durable', 'Lightweight'];
const brands = ['TechPro', 'StyleCo', 'HomeBase', 'ActiveLive', 'PureGlow', 'ReadWell'];

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
    const basePrice = Math.floor(Math.random() * 5000) + 200;
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 40) + 10 : 0;
    const price = Math.round(basePrice * (1 - discount / 100));
    const name = `${adj} ${sub.slice(0, -1)} ${i}`;

    products.push({
      name,
      slug: generateSlug(name),
      description: `Higher definition and better performance. This ${sub.toLowerCase()} is perfect for your everyday needs. Featuring advanced technology and sleek design, the ${adj} series offers unparalleled value.`,
      shortDescription: `A high-quality ${sub.toLowerCase()} for the modern lifestyle.`,
      price: price,
      originalPrice: discount > 0 ? basePrice : undefined,
      discount: discount,
      category: cat.name,
      subcategory: sub,
      brand: brand,
      stock: Math.floor(Math.random() * 100) + 5,
      isFeatured: Math.random() > 0.85,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      numReviews: Math.floor(Math.random() * 200),
      images: [{ url: `https://picsum.photos/seed/${i}/400/300` }],
      isActive: true
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
