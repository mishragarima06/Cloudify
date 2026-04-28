const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,   // in bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },

    // ── Storage ──
    storageKey: {
      type: String,   // Firebase storage path
      required: true,
    },
    encryptionIV: {
      type: String,   // AES-256 IV stored per file
      required: true,
    },

    // ── Owner ──
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── AI Classification ──
    category: {
      type: String,
      enum: ["document", "image", "video", "audio", "code", "spreadsheet", "other"],
      default: "other",
    },
    tags: [String],
    aiSummary: {
      type: String,
      default: null,
    },

    // ── Sharing ──
    sharedWith: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
      },
    ],
    shareLinks: [
      {
        token: String,
        expiresAt: Date,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ── Auto Expiry ──
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    },

    // ── Soft Delete ──
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ── Activity Log ──
    activityLog: [
      {
        action: { type: String, enum: ["upload", "download", "share", "delete"] },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", FileSchema);
