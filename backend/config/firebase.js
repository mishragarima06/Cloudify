const admin = require("firebase-admin");

let bucket = null;

try {
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  // Check if Firebase credentials are properly configured
  if (firebaseConfig.projectId && firebaseConfig.privateKey && firebaseConfig.clientEmail) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
    bucket = admin.storage().bucket();
    console.log("✅ Firebase initialized successfully");
  } else {
    console.warn("⚠️  Firebase credentials not properly configured - running in mock mode");
  }
} catch (error) {
  console.warn("⚠️  Firebase initialization failed - running in mock mode");
  console.warn(`Error: ${error.message}`);
}

module.exports = { bucket };
