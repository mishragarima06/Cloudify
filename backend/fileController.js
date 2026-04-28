const File = require("../models/File");
const User = require("../models/User");
const { bucket } = require("../config/firebase");
const { encryptFile, decryptFile } = require("../utils/encryption");
const { classifyWithAI } = require("../utils/classifier");
const crypto = require("crypto");

// ─────────────────────────────────────────
// @route   POST /api/files/upload
// @desc    Upload a file (encrypt → Firebase → MongoDB)
// @access  Protected
// ─────────────────────────────────────────
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, buffer, size } = req.file;

    // Step 1: AI Classification
    const { category, tags, summary } = await classifyWithAI(
      buffer,
      mimetype,
      originalname
    );

    // Step 2: Encrypt file
    const { encryptedBuffer, iv } = encryptFile(buffer);

    // Step 3: Upload encrypted file to Firebase
    const storageKey = `files/${req.user.id}/${Date.now()}_${originalname}`;
    const fileRef = bucket.file(storageKey);

    await fileRef.save(encryptedBuffer, {
      metadata: { contentType: "application/octet-stream" },
    });

    // Step 4: Set expiry (default 7 days, or custom from request)
    const expiryDays = parseInt(req.body.expiryDays) || 7;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    // Step 5: Save file info in MongoDB
    const file = await File.create({
      name: req.body.name || originalname,
      originalName: originalname,
      size,
      mimeType: mimetype,
      storageKey,
      encryptionIV: iv,
      owner: req.user.id,
      category,
      tags,
      aiSummary: summary,
      expiresAt,
      activityLog: [{ action: "upload", performedBy: req.user.id }],
    });

    // Step 6: Update user storage usage
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { storageUsed: size },
    });

    res.status(201).json({
      message: "File uploaded successfully ✅",
      file: {
        id: file._id,
        name: file.name,
        size: file.size,
        category: file.category,
        tags: file.tags,
        aiSummary: file.aiSummary,
        expiresAt: file.expiresAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/files
// @desc    Get all files of logged-in user
// @access  Protected
// ─────────────────────────────────────────
const getMyFiles = async (req, res) => {
  try {
    const { category, search } = req.query;

    const query = {
      owner: req.user.id,
      isDeleted: false,
    };

    // Filter by category
    if (category) query.category = category;

    // Search by name or tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const files = await File.find(query)
      .select("-encryptionIV -storageKey -activityLog")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: files.length, files });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/files/download/:id
// @desc    Download a file (decrypt and send)
// @access  Protected
// ─────────────────────────────────────────
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check access — owner or shared user
    const isOwner = file.owner.toString() === req.user.id.toString();
    const isShared = file.sharedWith.some(
      (s) => s.user.toString() === req.user.id.toString()
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check expiry
    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(410).json({ message: "File has expired" });
    }

    // Download encrypted file from Firebase
    const fileRef = bucket.file(file.storageKey);
    const [encryptedBuffer] = await fileRef.download();

    // Decrypt
    const decryptedBuffer = decryptFile(encryptedBuffer, file.encryptionIV);

    // Log activity
    file.activityLog.push({ action: "download", performedBy: req.user.id });
    await file.save();

    // Send file
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    res.setHeader("Content-Type", file.mimeType);
    res.send(decryptedBuffer);
  } catch (error) {
    res.status(500).json({ message: "Download failed", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/files/:id
// @desc    Delete a file (soft delete)
// @access  Protected (owner only)
// ─────────────────────────────────────────
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    // Only owner can delete
    if (file.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete this file" });
    }

    // Delete from Firebase
    try {
      await bucket.file(file.storageKey).delete();
    } catch (fbErr) {
      console.log("Firebase delete warning:", fbErr.message);
    }

    // Soft delete in MongoDB
    file.isDeleted = true;
    file.activityLog.push({ action: "delete", performedBy: req.user.id });
    await file.save();

    // Reduce user storage
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { storageUsed: -file.size },
    });

    res.status(200).json({ message: "File deleted successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/files/:id/share
// @desc    Share file with another user (by email)
// @access  Protected (owner only)
// ─────────────────────────────────────────
const shareWithUser = async (req, res) => {
  try {
    const { email, role } = req.body; // role: "viewer" or "editor"

    const file = await File.findById(req.params.id);
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only owner can share" });
    }

    // Find user to share with
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    // Check if already shared
    const alreadyShared = file.sharedWith.find(
      (s) => s.user.toString() === targetUser._id.toString()
    );

    if (alreadyShared) {
      alreadyShared.role = role || "viewer"; // update role if already shared
    } else {
      file.sharedWith.push({ user: targetUser._id, role: role || "viewer" });
    }

    file.activityLog.push({ action: "share", performedBy: req.user.id });
    await file.save();

    res.status(200).json({ message: `File shared with ${email} as ${role || "viewer"} ✅` });
  } catch (error) {
    res.status(500).json({ message: "Share failed", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/files/:id/share-link
// @desc    Generate a shareable link with expiry
// @access  Protected (owner only)
// ─────────────────────────────────────────
const generateShareLink = async (req, res) => {
  try {
    const { expiryHours } = req.body; // 1, 24, or 168 (7 days)

    const file = await File.findById(req.params.id);
    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only owner can generate share links" });
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + (expiryHours || 24) * 60 * 60 * 1000
    );

    file.shareLinks.push({ token, expiresAt });
    await file.save();

    const shareUrl = `${req.protocol}://${req.get("host")}/api/files/s/${token}`;

    res.status(200).json({
      message: "Share link generated ✅",
      shareUrl,
      expiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate link", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/files/s/:token
// @desc    Access file via share link (public)
// ─────────────────────────────────────────
const accessShareLink = async (req, res) => {
  try {
    const { token } = req.params;

    // Find file with this token
    const file = await File.findOne({
      "shareLinks.token": token,
      isDeleted: false,
    });

    if (!file) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    // Find the specific share link
    const shareLink = file.shareLinks.find((s) => s.token === token);

    if (new Date() > shareLink.expiresAt) {
      return res.status(410).json({ message: "This share link has expired" });
    }

    // Download and decrypt from Firebase
    const fileRef = bucket.file(file.storageKey);
    const [encryptedBuffer] = await fileRef.download();
    const decryptedBuffer = decryptFile(encryptedBuffer, file.encryptionIV);

    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    res.setHeader("Content-Type", file.mimeType);
    res.send(decryptedBuffer);
  } catch (error) {
    res.status(500).json({ message: "Access failed", error: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/files/:id/logs
// @desc    Get activity log of a file
// @access  Protected (owner only)
// ─────────────────────────────────────────
const getFileLogs = async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate("activityLog.performedBy", "name email");

    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ logs: file.activityLog });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  uploadFile,
  getMyFiles,
  downloadFile,
  deleteFile,
  shareWithUser,
  generateShareLink,
  accessShareLink,
  getFileLogs,
};
