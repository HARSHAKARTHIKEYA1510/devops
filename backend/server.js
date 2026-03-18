const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

dotenv.config();
connectDB();

const app = express();

// Global CORS enabled FIRST with credentials for local fetch
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://0.0.0.0:3000',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback to allow all if checking fails locally
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', uptime: process.uptime() });
});

app.get('/', (req, res) => res.send('API is running...'));

// Error handler
app.use(errorHandler);

const PORT = 5050; 
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
