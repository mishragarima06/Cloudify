const cron = require("node-cron");
const File = require("../models/File");
const { bucket } = require("../config/firebase");

const fileExpiryJob = () => {
  // Runs every day at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running auto file expiry job...");

    try {
      // Find all expired files that are not already deleted
      const expiredFiles = await File.find({
        expiresAt: { $lte: new Date() },
        isDeleted: false,
      });

      console.log(`🗑️  Found ${expiredFiles.length} expired files`);

      for (const file of expiredFiles) {
        try {
          // Delete from Firebase Storage
          await bucket.file(file.storageKey).delete();
          console.log(`✅ Deleted from Firebase: ${file.storageKey}`);
        } catch (firebaseErr) {
          console.log(`⚠️  Firebase delete failed for ${file.storageKey}`);
        }

        // Mark as deleted in MongoDB
        file.isDeleted = true;
        await file.save();
      }

      console.log("✅ Auto expiry job complete");
    } catch (error) {
      console.error("❌ Auto expiry job error:", error.message);
    }
  });

  console.log("📅 Auto file expiry cron job scheduled (runs at midnight daily)");
};

module.exports = fileExpiryJob;
