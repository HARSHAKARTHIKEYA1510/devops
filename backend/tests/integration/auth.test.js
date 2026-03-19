const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');

let mongoServer;
let app;

beforeAll(async () => {
  jest.setTimeout(120000); 
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'auth_test_secret';

  app = require('../../server');

  let retries = 10;
  while (mongoose.connection.readyState !== 1 && retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
    retries--;
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Authentication API Integration Tests', () => {
  const testUser = {
    name: 'Auth Test User',
    email: 'authtest@example.com',
    password: 'securepassword123'
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
    
    // Check if user was actually created in DB
    const dbUser = await User.findOne({ email: testUser.email });
    expect(dbUser).toBeTruthy();
    expect(dbUser.name).toBe(testUser.name);
  });

  it('should log in an existing user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
