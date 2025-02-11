const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // ✅ Import CORS
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Enable CORS Middleware
app.use(cors({
  origin: ["http://localhost:3000", "https://craftmy-plate.vercel.app"], // ✅ Allow Localhost & Deployed Frontend
  credentials: true
}));

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
