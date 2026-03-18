const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

dotenv.config({ path: __dirname + '/../.env' });

const seedProducts = [
  {
    name: 'Sony Alpha a7 IV Mirrorless Camera',
    description: 'The latest in the Alpha line, featuring a 33MP full-frame sensor, 4K 60p video, and real-time Eye AF for humans, animals, and birds.',
    shortDescription: '33MP Full-Frame Mirrorless Camera',
    price: 199990,
    originalPrice: 220000,
    images: [{ url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }],
    category: 'Electronics',
    brand: 'Sony',
    stock: 15,
    isFeatured: true,
    tags: ['camera', 'sony', 'photography', '4k'],
  },
  {
    name: 'Apple MacBook Pro M3 Max',
    description: 'Supercharged by M3 Max, this incredibly advanced chip delivers massive performance for extreme workflows.',
    shortDescription: '14-inch, M3 Max, 36GB RAM, 1TB SSD',
    price: 319900,
    originalPrice: 340000,
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }],
    category: 'Electronics',
    brand: 'Apple',
    stock: 5,
    isFeatured: true,
    tags: ['laptop', 'apple', 'macbook'],
  },
  {
    name: 'Nike Air Max 270 React',
    description: 'Nike\'s first lifestyle Air Max meets the softest, smoothest and most resilient foam yet.',
    shortDescription: 'Premium lifestyle running shoes',
    price: 12995,
    originalPrice: 15995,
    images: [{ url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }],
    category: 'Fashion',
    brand: 'Nike',
    stock: 42,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['Black', 'White', 'Red'],
    isFeatured: true,
  },
  {
    name: 'Samsung 49" Odyssey G9 Gaming Monitor',
    description: 'Unmatched immersion with 1000R curvature, 240Hz refresh rate, and 1ms response time.',
    shortDescription: 'Ultrawide Curved Gaming Monitor',
    price: 135000,
    images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }],
    category: 'Electronics',
    brand: 'Samsung',
    stock: 8,
    isFeatured: true,
  },
  {
    name: 'Modern Upholstered Velvet Sofa',
    description: 'Elevate your living room with this luxurious emerald green velvet sofa, featuring deep channel tufting and gold legs.',
    shortDescription: '3-Seater Emerald Green Sofa',
    price: 45000,
    originalPrice: 55000,
    images: [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }],
    category: 'Home & Living',
    brand: 'Urban Living',
    stock: 12,
    isFeatured: false,
  },
  {
    name: 'Bose QuietComfort Ultra',
    description: 'World-class noise cancellation, quieter than ever before. Breakthrough spatialized audio for immersive listening.',
    shortDescription: 'Wireless Noise Cancelling Headphones',
    price: 35900,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }],
    category: 'Electronics',
    brand: 'Bose',
    stock: 25,
    colors: ['Black', 'White Smoke'],
    isFeatured: true,
  },
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Clear existing
    await User.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    console.log('🗑️  Existing data cleared');

    // Add Admin User
    const adminPass = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shopzen.com',
      password: adminPass, // Need to set directly to bypass pre save if using create
      role: 'admin',
      isVerified: true,
      isActive: true,
    });
    
    // Explicitly update password since create might double hash if we pass raw
    admin.password = adminPass;
    await admin.save({ validateBeforeSave: false });
    
    // User
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@shopzen.com',
      password: await bcrypt.hash('test1234', 12),
      role: 'user',
      isVerified: true,
    });

    console.log('👤 Admin & Test users created');

    // Add Products
    const productsToSeed = seedProducts.map((p, i) => ({
      ...p,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now() + i
    }));
    await Product.insertMany(productsToSeed);
    console.log('📦 Products added');

    // Add Coupons
    await Coupon.create([
      { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, description: 'Welcome 20% OFF' },
      { code: 'FLAT500', discountType: 'fixed', discountValue: 500, minOrderAmount: 2000, description: 'Flat 500 OFF on 2000+' }
    ]);
    console.log('🎟️  Coupons added');

    console.log('🌱 Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding DB: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
