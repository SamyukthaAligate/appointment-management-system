const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../backend/models/User');

// Connect to MongoDB
let cached = global.mongo;
if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = async (req, res) => {
  await connectToDatabase();
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'POST') {
    try {
      const { name, email, password, role } = req.body;

      // Validate input
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters long." });
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
      }
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
      }
      
      if (role && !['PATIENT', 'DOCTOR'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified." });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered. Please use a different email or try logging in." });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create and save the new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "PATIENT",
      });

      const savedUser = await newUser.save();

      // Respond without the password
      const { password: _, ...userResponse } = savedUser._doc;
      res.status(201).json(userResponse);
      
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: "Unable to process request. Please try again later." });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
