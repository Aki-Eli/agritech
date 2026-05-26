/**
 * AgriTech API — Express server entry point.
 * Connects to MongoDB and registers all API route modules.
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the .env file in this directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────

// In production, restrict CORS to your actual frontend origin.
// The CORS_ORIGIN env variable should be set in production (e.g. https://yourapp.com).
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// ── Validate required environment variables ─────────────────────────────────
if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI is not defined. Check your .env file.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined. Check your .env file.');
  process.exit(1);
}

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/users',          require('./routes/users'));
app.use('/api/farms',          require('./routes/farms'));
app.use('/api/crops',          require('./routes/crops'));
app.use('/api/weather',        require('./routes/weather'));
app.use('/api/alerts',         require('./routes/alerts'));
app.use('/api/products',       require('./routes/products'));
app.use('/api/orders',         require('./routes/orders'));
app.use('/api/bookings',       require('./routes/bookings'));
app.use('/api/forum',          require('./routes/forum'));
app.use('/api/admin',          require('./routes/admin'));
app.use('/api/farm-activities',require('./routes/farmActivities'));
app.use('/api/soil-health',    require('./routes/soilHealth'));
app.use('/api/support',        require('./routes/support'));
app.use('/api/experts',        require('./routes/experts'));

// ── Global error handler ────────────────────────────────────────────────────
// Catches any errors passed via next(err) from route handlers.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ msg: 'An unexpected server error occurred' });
});

// ── Database connection & server start ─────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
