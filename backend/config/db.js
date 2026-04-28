const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4, 
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes("IP") || error.message.includes("whitelist")) {
      console.error("💡 TIP: Your IP might not be whitelisted in MongoDB Atlas.");
    }

    console.log("⚠️  Starting in-memory MongoDB fallback to keep the app running...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Connected: ${mongoUri}`);
    } catch (fallbackError) {
      console.error(`❌ In-Memory MongoDB Failed: ${fallbackError.message}`);
      console.error("❌ Exiting process - database is required.");
      process.exit(1);
    }
  }
};

module.exports = connectDB;
