require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import models to register them with Mongoose
require('./models/User');
require('./models/Address');
require('./models/Product');
require('./models/ProductMaster');
require('./models/Pincode');
require('./models/Store');
require('./models/Department');
require('./models/Category');
require('./models/Subcategory');
require('./models/PaymentMode');
require('./models/DeliverySlot');
require('./models/AddressBook');
require('./models/Counter');
require('./models/Favorite');
require('./models/Cart');
require('./models/Order');
require('./models/BestSeller');
require('./models/PopularCategory');
require('./models/Advertisement');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const subcategoryRoutes = require('./routes/subcategories');
const paymentModeRoutes = require('./routes/payment-modes');
const deliverySlotRoutes = require('./routes/delivery-slots');
const addressCrudRoutes = require('./routes/address-crud');
const favoriteRoutes = require('./routes/favorites');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const bannerRoutes = require('./routes/banners');
const addressRoutes = require('./routes/addresses');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/upload');
const pincodeRoutes = require('./routes/pincodes');
const storeRoutes = require('./routes/stores');
const departmentRoutes = require('./routes/departments');
const bestSellerRoutes = require('./routes/best-sellers');
const popularCategoryRoutes = require('./routes/popular-categories');
const advertisementRoutes = require('./routes/advertisements');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

const parseAllowedOrigins = () => {
  if (!process.env.CLIENT_URL) {
    return [];
  }

  return process.env.CLIENT_URL
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();
const allowAllOrigins = allowedOrigins.length === 0 || allowedOrigins.includes('*');

const corsOptionsDelegate = (req, callback) => {
  const requestOrigin = req.header('Origin');

  if (!requestOrigin) {
    // Allow requests with no origin (like mobile apps, curl requests, Postman)
    return callback(null, {
      origin: true
    });
  }

  if (allowAllOrigins || allowedOrigins.includes(requestOrigin)) {
    return callback(null, {
      origin: requestOrigin
    });
  }

  console.warn(`🛑 CORS blocked origin: ${requestOrigin}`);
  return callback(null, {
    origin: false
  });
};

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Cache-Control'],
  exposedHeaders: ['Content-Length', 'Date', 'X-Request-Id'],
  optionsSuccessStatus: 204,
  maxAge: 86400
};

app.use(cors((req, callback) => {
  corsOptionsDelegate(req, (error, options) => {
    if (error) {
      return callback(error, options);
    }
    callback(null, { ...corsOptions, ...options });
  });
}));
app.options('*', cors((req, callback) => {
  corsOptionsDelegate(req, (error, options) => {
    if (error) {
      return callback(error, options);
    }
    callback(null, { ...corsOptions, ...options });
  });
}));

// Rate limiting - stricter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:1000, // limit each IP to 1000 requests per windowMs for auth routes
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // limit each IP to 1000 requests per windowMs for general routes
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Patel E-commerce API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes); // Apply stricter rate limiting to auth routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/payment-modes', paymentModeRoutes);
app.use('/api/delivery-slots', deliverySlotRoutes);
app.use('/api/address-crud', addressCrudRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/pincodes', pincodeRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/best-sellers', bestSellerRoutes);
app.use('/api/popular-categories', popularCategoryRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
🚀 Patel E-commerce API Server Started!
📍 Running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/health
🔗 Database: Connected to MongoDB Atlas
🔐 Authentication: OTP-based with JWT tokens
⚡ Ready to handle requests!

📱 Authentication Endpoints:
   POST /api/auth/send-otp - Send OTP to mobile
   POST /api/auth/verify-otp - Verify OTP and get token
   GET  /api/auth/profile - Get user profile (protected)
   PUT  /api/auth/profile - Update user profile (protected)
   POST /api/auth/is-active - Update user activity (protected)
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();

module.exports = app;
