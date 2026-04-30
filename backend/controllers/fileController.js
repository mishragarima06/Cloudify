const File = require("../models/File");
const User = require("../models/User");
const { bucket } = require("../config/firebase");
const { encryptFile, decryptFile } = require("../utils/encryption");
const { classifyWithAI } = require("../utils/classifier");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, buffer, size } = req.file;

    const { category, tags, summary } = await classifyWithAI(
      buffer,
      mimetype,
      originalname
    );

    // Skip Firebase upload in mock mode
    let storageKey = `files/${req.user.id}/${Date.now()}_${originalname}`;
    let iv = "";

    if (bucket) {
      const { encryptedBuffer, iv: newIv } = encryptFile(buffer);
      iv = newIv;

      const fileRef = bucket.file(storageKey);
      await fileRef.save(encryptedBuffer, {
        metadata: { contentType: "application/octet-stream" },
      });
    } else {
      console.warn("⚠️  Firebase not available - file not uploaded to storage");
    }

    const expiryDays = parseInt(req.body.expiryDays) || 7;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    try {
      const file = await File.create({
        name: req.body.name || originalname,
        originalName: originalname,
        size,
        mimeType: mimetype,
        storageKey,
        encryptionIV: iv || "unencrypted",
        owner: req.user.id,
        category,
        tags,
        aiSummary: summary,
        expiresAt,
        activityLog: [{ action: "upload", performedBy: req.user.id }],
      });

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
    } catch (dbError) {
      console.error("❌ Database error during file upload:", dbError);
      res.status(500).json({ message: "Database error during upload", error: dbError.message });
    }
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

const getMyFiles = async (req, res) => {
  try {
    const { category, search } = req.query;

    try {
      const query = {
        owner: req.user.id,
        isDeleted: false,
      };

      if (category) query.category = category;

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      const files = await File.find(query)
        .select("-encryptionIV -storageKey -activityLog")
        .sort({ createdAt: -1 });

      // Compute stats
      const usedBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
      const sharedCount = files.filter(f => f.sharedWith && f.sharedWith.length > 0).length;

      res.status(200).json({
        count: files.length,
        files,
        stats: { total: files.length, usedBytes, shared: sharedCount },
      });
    } catch (dbError) {
      // Mock response for development
      console.log("⚠️  Database not available for getMyFiles, returning empty mock");
      res.status(200).json({ count: 0, files: [], stats: { total: 0, usedBytes: 0, shared: 0 } });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    const isOwner = file.owner.toString() === req.user.id.toString();
    const isShared = file.sharedWith.some(
      (s) => s.user.toString() === req.user.id.toString()
    );

    if (!isOwner && !isShared) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(410).json({ message: "File has expired" });
    }

    const fileRef = bucket.file(file.storageKey);
    const [encryptedBuffer] = await fileRef.download();

    const decryptedBuffer = decryptFile(encryptedBuffer, file.encryptionIV);

    file.activityLog.push({ action: "download", performedBy: req.user.id });
    await file.save();

    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    res.setHeader("Content-Type", file.mimeType);
    res.send(decryptedBuffer);
  } catch (error) {
    res.status(500).json({ message: "Download failed", error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the owner can delete this file" });
    }

    try {
      await bucket.file(file.storageKey).delete();
    } catch (fbErr) {
      console.log("Firebase delete warning:", fbErr.message);
    }

    file.isDeleted = true;
    file.activityLog.push({ action: "delete", performedBy: req.user.id });
    await file.save();

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { storageUsed: -file.size },
    });

    res.status(200).json({ message: "File deleted successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

const shareWithUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    const file = await File.findById(req.params.id);

    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the owner can share this file" });
    }

    const sharedUser = await User.findOne({ email });
    if (!sharedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyShared = file.sharedWith.some(
      (s) => s.user.toString() === sharedUser._id.toString()
    );

    if (alreadyShared) {
      return res.status(400).json({ message: "File already shared with this user" });
    }

    file.sharedWith.push({ user: sharedUser._id, role: role || "viewer" });
    file.activityLog.push({ action: "share", performedBy: req.user.id });
    await file.save();

    res.status(200).json({ message: "File shared successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Share failed", error: error.message });
  }
};

const generateShareLink = async (req, res) => {
  try {
    const { expiryDays } = req.body;
    const file = await File.findById(req.params.id);

    if (!file || file.isDeleted) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Only the owner can generate share links" });
    }

    const token = require("crypto").randomBytes(32).toString("hex");
    const linkExpiresAt = new Date(Date.now() + (expiryDays || 7) * 24 * 60 * 60 * 1000);

    file.shareLinks.push({ token, expiresAt: linkExpiresAt });
    await file.save();

    res.status(200).json({
      message: "Share link generated ✅",
      shareLink: {
        token,
        url: `${process.env.FRONTEND_URL}/share/${token}`,
        expiresAt: linkExpiresAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Generate link failed", error: error.message });
  }
};

const accessShareLink = async (req, res) => {
  try {
    const { token } = req.params;

    const file = await File.findOne({
      "shareLinks.token": token,
      isDeleted: false,
    });

    if (!file) {
      return res.status(404).json({ message: "Share link not found or expired" });
    }

    const shareLink = file.shareLinks.find((s) => s.token === token);
    if (!shareLink || new Date() > shareLink.expiresAt) {
      return res.status(410).json({ message: "Share link has expired" });
    }

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

const getFileLogs = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
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

const toggleStar = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
    if (!file) return res.status(404).json({ message: "File not found" });

    file.starred = !file.starred;
    await file.save();

    res.status(200).json({ message: "Starred status updated", starred: file.starred });
  } catch (error) {
    res.status(500).json({ message: "Error updating star status", error: error.message });
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
  toggleStar,
};
