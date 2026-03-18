const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

let mongoServer;
let app;
let adminToken;

beforeAll(async () => {
  jest.setTimeout(120000); // Allow long download time
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'testsecret123';

  // Import app AFTER env is set
  app = require('../../server');

  // Wait for mongoose connection
  let retries = 10;
  while (mongoose.connection.readyState !== 1 && retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
    retries--;
  }

  // Create admin user for tests
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    isVerified: true
  });

  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Product API Integration Tests', () => {
  it('should create a new product via POST /api/products (Admin Authorized)', async () => {
    const productData = {
      name: 'Integration Test Drone',
      description: 'A drone specifically for integration testing',
      price: 25000,
      category: 'Electronics',
      stock: 10,
      isActive: true
    };

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toEqual(productData.name);
  });

  it('should retrieve all products via GET /api/products', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    // There should be at least one product (from the previous test)
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    expect(res.body.products[0].name).toEqual('Integration Test Drone');
  });

  it('should return 404 for a non-existent product ID', async () => {
    const res = await request(app).get('/api/products/64f1d2e1b6a7c3e1e8d4a1b0');
    expect(res.statusCode).toEqual(404);
  });
});
