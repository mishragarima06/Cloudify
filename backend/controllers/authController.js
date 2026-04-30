const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const sendEmail = require("../utils/email");


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();
    
    console.log(`📝 Registration attempt for: ${cleanEmail}`);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if email already exists
    try {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        console.log(`⚠️  Registration failed: Email ${cleanEmail} already exists`);
        return res.status(409).json({ message: "Email already registered" });
      }
    } catch (dbError) {
      console.log("⚠️  Database not available for findOne, check if connection is active");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
      const user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        otp,
        otpExpires,
      });

      console.log(`\n📧 OTP for ${cleanEmail}: ${otp}\n`);

      // Send actual email
      try {
        await sendEmail({
          email: user.email,
          subject: "Cloudify - Verify Your Account",
          message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #4f46e5; text-align: center;">Welcome to Cloudify</h2>
              <p>Hi ${user.name},</p>
              <p>Thank you for joining Cloudify! Please use the following code to verify your account:</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937; margin: 25px 0;">
                ${otp}
              </div>
              <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="text-align: center; color: #9ca3af; font-size: 12px;">© 2026 Cloudify Inc. All rights reserved.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("⚠️  Failed to send email:", emailError.message);
        // We continue because the OTP is still logged to the console
      }

      const tempToken = jwt.sign(
        { id: user._id, is2FATemp: true },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );


      res.status(201).json({
        message: "Registration successful. Please verify OTP.",
        requires2FA: true,
        tempToken,
      });
    } catch (dbError) {
      console.error("⚠️  Database error during User.create:", dbError.message);
      
      // If DB failed, we can't save the user, so "mock mode" is just for UI testing
      const mockUserId = "123456789012345678901234";
      const tempToken = jwt.sign(
        { id: mockUserId, is2FATemp: true },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      console.log(`\n📧 MOCK OTP for ${cleanEmail}: 123456\n`);

      res.status(201).json({
        message: "Registration successful (mock mode). User was NOT saved to DB.",
        requires2FA: true,
        tempToken,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const dbType = global.isInMemoryDB ? "In-Memory" : "Atlas";
    
    console.log(`🔐 Login attempt for: ${email} (${dbType} DB)`);

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    try {
      // Find user with case-insensitive email
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      
      if (!user) {
        console.log(`❌ Login failed: User ${email} not found in ${dbType} DB`);
        let extra = global.isInMemoryDB ? " (Note: DB was recently restarted, you might need to Register again)" : "";
        return res.status(401).json({ message: "Invalid email or password" + extra });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`❌ Login failed: Incorrect password for ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.isTwoFactorEnabled) {
        console.log(`ℹ️  2FA required for ${email}`);
        const tempToken = jwt.sign(
          { id: user._id, is2FATemp: true },
          process.env.JWT_SECRET,
          { expiresIn: "10m" }
        );
        return res.status(200).json({
          message: "2FA required",
          requires2FA: true,
          tempToken,
        });
      }

      console.log(`✅ Login successful for ${email}`);
      res.status(200).json({
        message: "Login successful",
        user: { id: user._id, name: user.name, email: user.email },
        token: generateToken(user._id),
      });
    } catch (dbError) {
      console.error(`❌ Database error during login for ${email}:`, dbError.message);
      
      // True mock mode only if DB is completely unavailable
      console.log("⚠️  Falling back to total mock mode (dangerous)");
      const mockUserId = "mock_user_" + email.replace(/[^a-z0-9]/g, '');
      res.status(200).json({
        message: "Login successful (mock mode)",
        user: { id: mockUserId, name: "Test User", email },
        token: generateToken(mockUserId),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const secret = speakeasy.generateSecret({
      name: `Cloudify (${user.email})`,
      length: 20,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: "Scan this QR code with Google Authenticator",
      qrCode: qrCodeUrl,
      secret: secret.base32,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const enable2FA = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA setup not started. Call /2fa/setup first." });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP. Try again." });
    }

    user.isTwoFactorEnabled = true;
    await user.save();

    res.status(200).json({ message: "2FA enabled successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { otp } = req.body;

    // Extract userId from the temp Bearer token sent in Authorization header
    let userId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        if (!decoded.is2FATemp) {
          return res.status(401).json({ message: "Invalid temp token" });
        }
        userId = decoded.id;
      } catch {
        return res.status(401).json({ message: "Temp token expired or invalid" });
      }
    } else {
      return res.status(401).json({ message: "No temp token provided" });
    }

    let user;
    try {
      user = await User.findById(userId);
    } catch (dbError) {
      console.log("⚠️  Database not available for verify2FA, using mock user");
      // Create a mock user object
      user = {
        _id: userId,
        name: "Mock User",
        email: "mock@example.com",
        otp: "123456",
        otpExpires: new Date(Date.now() + 100000),
        save: async () => {} // No-op save
      };
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isValid = false;

    // Check if it's an email OTP (registration)
    if (user.otp && user.otpExpires > Date.now()) {
      if (user.otp === otp || otp === "123456") { // 123456 is master bypass for testing
        isValid = true;
        // Clear OTP after successful use
        user.otp = null;
        user.otpExpires = null;
        await user.save();
      }
    } 
    // Otherwise check TOTP (if enabled)
    else if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: otp,
        window: 1,
      });
    }

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.status(200).json({
      message: "Login successful ✅",
      user: { id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    try {
      const user = await User.findById(req.user.id).select("-password -twoFactorSecret");
      res.status(200).json(user);
    } catch (dbError) {
      // Mock response
      console.log("⚠️  Database not available for getMe, returning mock user");
      res.status(200).json(req.user);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  setup2FA,
  enable2FA,
  verify2FA,
  getMe,
  logout,
};
