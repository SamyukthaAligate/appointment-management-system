const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('../backend/routes/auth');
const doctorRoutes = require('../backend/routes/doctors');
const appointmentRoutes = require('../backend/routes/appointments');
const authMiddleware = require('../backend/middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", authMiddleware, doctorRoutes);
app.use("/api/appointments", authMiddleware, appointmentRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// Export for Vercel
module.exports = app;
