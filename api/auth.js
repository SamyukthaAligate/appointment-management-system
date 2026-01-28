const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Connect to MongoDB
let cached = global.mongo;
if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_change_this";

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    await connectToDatabase();
    
    const { url } = req;
    console.log('=== AUTH API DEBUG ===');
    console.log('Request URL:', url);
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
    console.log('Environment variables:', {
      MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    });
    console.log('===================');
    
    if (req.method === 'POST') {
      // Handle signup
      if (url.includes('/api/auth/signup') || req.body.action === 'signup') {
        const { name, email, password, role } = req.body;

        console.log('Signup request:', { name, email, role });

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
        console.log('User created successfully:', userResponse);
        res.status(201).json(userResponse);
      }
      
      // Handle login
      else if (url.includes('/api/auth/login') || req.body.action === 'login') {
        const { email, password: plainTextPassword, role } = req.body;

        console.log('Login request:', { email, role });

        // Validate input
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ message: "Please provide a valid email address." });
        }
        
        if (!plainTextPassword || plainTextPassword.length < 1) {
          return res.status(400).json({ message: "Password is required." });
        }
        
        if (!role || !['PATIENT', 'DOCTOR'].includes(role)) {
          return res.status(400).json({ message: "Please select a valid role (Patient or Doctor)." });
        }

        // Find user by email and role
        const user = await User.findOne({ email, role });
        if (!user) {
          return res.status(401).json({ message: "No account found with this email and role combination." });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(plainTextPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Incorrect password. Please try again." });
        }

        // Create and sign the JWT
        const payload = {
          user: {
            id: user.id,
            role: user.role,
          },
        };

        jwt.sign(
          payload,
          JWT_SECRET,
          { expiresIn: "1h" },
          (err, token) => {
            if (err) throw err;
            const { password: _, ...userResponse } = user._doc;
            console.log('Login successful:', userResponse);
            res.json({ token, user: userResponse });
          }
        );
      }
      
      else {
        console.log('Endpoint not found. URL:', url);
        res.status(404).json({ message: "Endpoint not found. Use /api/auth/signup or /api/auth/login" });
      }
    }
    
    else {
      console.log('Method not allowed:', req.method);
      res.status(405).json({ message: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('=== AUTH ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    console.error('==================');
    res.status(500).json({ message: "Unable to process request. Please try again later.", error: error.message });
  }
};
