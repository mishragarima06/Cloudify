const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env vars first!
dotenv.config();

const connectDB = require("./config/db");
const fileExpiryJob = require("./utils/fileExpiry");

// Connect to MongoDB is handled at the bottom

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/files", require("./routes/files"));
app.use("/api/ai", require("./routes/ai"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Cloudify Backend Running ✅" });
});

// Start server only after DB connection attempt finishes
connectDB().then(() => {
  // Start auto file expiry cron job
  fileExpiryJob();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
