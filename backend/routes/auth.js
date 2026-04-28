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

router.post("/register", register);
router.post("/login", login);
router.post("/2fa/verify", verify2FA);

router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/enable", protect, enable2FA);

module.exports = router;
