const mongoose = require('mongoose');
const dotenv = require('dotenv');
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
    imageIds: [
      '1498243667342-262147db602c', // Laptop
      '1511706853205-01e4c000dfb5', // Phone
      '1505740420928-5e560c06d30e', // Headphones
      '1523275335684-37898b6baf30', // Watch
      '1496181133206-80ce9b88a853', // Laptop back
      '1461151351185-131103c80036'  // Camera
    ]
  },
  { 
    name: 'Clothing', 
    sub: ['T-Shirts', 'Jeans', 'Jackets', 'Shirts', 'Sweaters', 'Trousers'],
    imageIds: [
      '1434389677639-e455e3477163', // White shirt
      '1490481651871-ab68ff25d43d', // Hoodie
      '1523381210434-271e8be1f52b', // Rack
      '1551488831-00ddcb6c6bd3', // Jacket
      '1544441893-675973e3a985', // Table layout
      '1618354691373-d851c5c3a990'  // T-shirt
    ]
  },
  { 
    name: 'Footwear', 
    sub: ['Sneakers', 'Boots', 'Loafers', 'Sandals', 'Running Shoes', 'Formal Shoes'],
    imageIds: [
      '1542272604-787c3835533d', // Sneaker
      '1606107557195-0e29a4b5b4aa', // Formal
      '1560769629-975ec94e6a86', // Shoe stack
      '1512374382149-43326102606a', // High tops
      '1595950653106-6c9ebd614d3a', // Stylish
      '1600185365483-26d7a4cc7519'  // Casual
    ]
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
    
    // Pick a high-quality ID and add variations via Unsplash API params
    const imageId = cat.imageIds[i % cat.imageIds.length];
    const imageUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80&mod=${i}`;

    const basePrice = cat.name === 'Electronics' 
      ? Math.floor(Math.random() * 80000) + 5000 
      : Math.floor(Math.random() * 5000) + 500;
    const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 40) + 10 : 0;
    const price = Math.round(basePrice * (1 - discount / 100));
    const name = `${adj} ${sub} ${i}`;

    products.push({
      name,
      slug: generateSlug(name),
      description: `Elevate your lifestyle with the ${name}. This high-quality product from ${brand} is designed for maximum performance and style. Whether for work or leisure, it delivers reliability you can count on. Featuring a premium monochrome aesthetic that fits any modern environment.`,
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
      images: [{ url: imageUrl }],
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
