
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
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
    res.status(500).json({ message: "Server error during signup.", error });
  }
});

// Universal Login
router.post("/login", async (req, res) => {
  try {
    const { email, password: plainTextPassword, role } = req.body;

    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(plainTextPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
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
    res.status(500).json({ message: "Server error during login.", error });
  }
});

module.exports = router;
