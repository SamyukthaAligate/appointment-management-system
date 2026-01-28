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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_change_this";

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
      const { email, password: plainTextPassword, role } = req.body;

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
          res.json({ token, user: userResponse });
        }
      );
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Unable to process request. Please try again later." });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
