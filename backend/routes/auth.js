
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// IMPORTANT: In a production application, use a strong, secret key stored in environment variables.
const JWT_SECRET = "your_super_secret_key_change_this";

// Patient Signup
router.post("/signup", async (req, res) => {
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
      role: role || "PATIENT", // Default to PATIENT if role is not provided
    });

    const savedUser = await newUser.save();

    // Respond without the password
    const { password: _, ...userResponse } = savedUser._doc;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Signup error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid data provided. Please check all fields and try again." });
    }
    res.status(500).json({ message: "Unable to create account. Please try again later." });
  }
});

// Universal Login
router.post("/login", async (req, res) => {
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
      { expiresIn: "1h" }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        const { password: _, ...userResponse } = user._doc;
        res.json({ token, user: userResponse });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Unable to log in. Please try again later." });
  }
});

module.exports = router;
