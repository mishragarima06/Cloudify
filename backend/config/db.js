const mongoose = require("mongoose");

const connectDB = async () => {
  // Primary: Try SRV connection string
  const srvUri = process.env.MONGO_URI;

  // Fallback: Direct connection bypassing DNS SRV lookup
  const directUri =
    "mongodb://garimachmishra_db_user:garima123@ac-n9wd3bw-shard-00-00.bt1nipw.mongodb.net:27017,ac-n9wd3bw-shard-00-01.bt1nipw.mongodb.net:27017,ac-n9wd3bw-shard-00-02.bt1nipw.mongodb.net:27017/?authSource=admin&replicaSet=atlas-p4xdn8-shard-0&ssl=true&appName=Cluster0";

  const options = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
  };

  // Try SRV first
  try {
    const conn = await mongoose.connect(srvUri, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (srvError) {
    console.warn(`⚠️  SRV connection failed: ${srvError.message}`);
    console.log("🔄 Trying direct connection to Atlas shards...");
  }

  // Try direct connection (bypasses DNS SRV lookup)
  try {
    const conn = await mongoose.connect(directUri, options);
    console.log(`✅ MongoDB Connected (direct): ${conn.connection.host}`);
    return;
  } catch (directError) {
    console.error(`❌ Direct connection also failed: ${directError.message}`);
    console.error("💡 FIX REQUIRED: Go to MongoDB Atlas → Security → Network Access");
    console.error("   → Add your current IP address (or 0.0.0.0/0 for dev)");
    console.log("⚠️  Starting in-memory MongoDB so app stays running...");
  }

  // Last resort: in-memory MongoDB so rest of the app works
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`✅ In-Memory MongoDB started: ${mongoUri}`);
    console.log("⚠️  NOTE: Data will NOT persist. Fix Atlas IP whitelist for real data.");
  } catch (fallbackError) {
    console.error(`❌ In-Memory MongoDB also failed: ${fallbackError.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
