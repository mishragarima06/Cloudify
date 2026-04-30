const mongoose = require("mongoose");

// Global flag to track DB state
global.isInMemoryDB = false;

const connectDB = async () => {
  const srvUri = process.env.MONGO_URI;
  
  const options = {
    serverSelectionTimeoutMS: 5000, // Faster timeout for quicker fallback
    connectTimeoutMS: 10000,
  };

  if (!srvUri) {
    console.warn("⚠️  MONGO_URI not found in .env. Skipping Atlas connection.");
  } else {
    try {
      console.log("🔄 Connecting to MongoDB Atlas...");
      const conn = await mongoose.connect(srvUri, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      global.isInMemoryDB = false;
      return;
    } catch (srvError) {
      console.warn(`⚠️  Atlas connection failed: ${srvError.message}`);
    }
  }

  // Fallback to In-Memory MongoDB
  try {
    console.log("🔄 Starting In-Memory MongoDB fallback...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    global.isInMemoryDB = true;
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ In-Memory MongoDB started: ${mongoUri}`);
    console.log("⚠️  WARNING: Data will NOT persist across restarts!");
    console.log("⚠️  Fix your Atlas IP whitelist to use real database.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (fallbackError) {
    console.error(`❌ CRITICAL: In-Memory MongoDB also failed: ${fallbackError.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
