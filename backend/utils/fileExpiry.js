const cron = require("node-cron");
const File = require("../models/File");
const { bucket } = require("../config/firebase");

const fileExpiryJob = () => {
  if (!bucket) {
    console.warn("⚠️  Firebase not initialized - skipping auto expiry job");
    return;
  }

  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running auto file expiry job...");

    try {
      const expiredFiles = await File.find({
        expiresAt: { $lte: new Date() },
        isDeleted: false,
      });

      console.log(`🗑️  Found ${expiredFiles.length} expired files`);

      for (const file of expiredFiles) {
        try {
          await bucket.file(file.storageKey).delete();
          console.log(`✅ Deleted from Firebase: ${file.storageKey}`);
        } catch (firebaseErr) {
          console.log(`⚠️  Firebase delete failed for ${file.storageKey}`);
        }

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
