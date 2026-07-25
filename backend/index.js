require('./tracing');

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const defaultOrigins = [
  'http://localhost:3000',
  'https://craft-my-plate-lovat.vercel.app',
];

function buildAllowedOrigins() {
  const fromEnv = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...defaultOrigins, ...fromEnv])];
}

const allowedOrigins = buildAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (/^https:\/\/[\w-]+[\w.-]*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/authRoute', require('./routes/authRoute'));
app.use('/api/adminusers',authMiddleware, require('./routes/adminusers'));


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
