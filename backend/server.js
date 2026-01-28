
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const doctorRoutes = require("./routes/doctors");
const appointmentRoutes = require("./routes/appointments");
const authMiddleware = require("./middleware/auth");

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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => console.log("Backend running on port 5000"));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });
