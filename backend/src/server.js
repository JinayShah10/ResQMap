require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const facilityRoutes = require('./routes/facilityRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "ResQMap API is running"
  });
});

// Configure Port
const PORT = process.env.PORT || 5000;

// Connect to Database & Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT);
  } catch (error) {
    console.error(`Database Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

