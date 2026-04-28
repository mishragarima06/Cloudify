const express = require("express");
const router = express.Router();
const {
  register,
  login,
  setup2FA,
  enable2FA,
  verify2FA,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/2fa/verify", verify2FA);  // Step 2 login with OTP

// Protected routes (need JWT token)
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/2fa/setup", protect, setup2FA);    // Get QR code
router.post("/2fa/enable", protect, enable2FA);  // Confirm OTP to activate 2FA

module.exports = router;
