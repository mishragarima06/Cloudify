const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register new user
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user (Step 1 — password check)
//          If 2FA enabled → ask for OTP
//          If 2FA disabled → return token directly
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If 2FA is enabled, don't give token yet — ask for OTP
    if (user.isTwoFactorEnabled) {
      return res.status(200).json({
        message: "2FA required",
        twoFactorRequired: true,
        userId: user._id, // send this to Step 2
      });
    }

    // 2FA not enabled — login complete
    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/2fa/setup
// @desc    Generate 2FA QR code for user to scan
// @access  Protected (user must be logged in)
// ─────────────────────────────────────────
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Cloudify (${user.email})`,
      length: 20,
    });

    // Save secret temporarily (not enabled yet until verified)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code image
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: "Scan this QR code with Google Authenticator",
      qrCode: qrCodeUrl,    // base64 image to show on frontend
      secret: secret.base32, // backup code for manual entry
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/2fa/enable
// @desc    Verify OTP and enable 2FA
// @access  Protected
// ─────────────────────────────────────────
const enable2FA = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA setup not started. Call /2fa/setup first." });
    }

    // Verify OTP
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP. Try again." });
    }

    // Enable 2FA
    user.isTwoFactorEnabled = true;
    await user.save();

    res.status(200).json({ message: "2FA enabled successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/2fa/verify
// @desc    Login Step 2 — Verify OTP and get JWT token
// ─────────────────────────────────────────
const verify2FA = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP correct — give JWT token
    res.status(200).json({
      message: "Login successful ✅",
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/logout
// @desc    Logout (frontend deletes token)
// @access  Protected
// ─────────────────────────────────────────
const logout = async (req, res) => {
  // JWT is stateless — actual logout happens on frontend by deleting token
  // Here we just confirm the action
  res.status(200).json({ message: "Logged out successfully" });
};

// ─────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get current logged in user info
// @access  Protected
// ─────────────────────────────────────────
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -twoFactorSecret");
  res.status(200).json(user);
};

module.exports = { register, login, setup2FA, enable2FA, verify2FA, logout, getMe };
