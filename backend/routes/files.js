const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadFile,
  getMyFiles,
  downloadFile,
  deleteFile,
  shareWithUser,
  generateShareLink,
  accessShareLink,
  getFileLogs,
  toggleStar,
} = require("../controllers/fileController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const blockedTypes = ["application/x-msdownload", "application/x-executable"];
    if (blockedTypes.includes(file.mimetype)) {
      return cb(new Error("This file type is not allowed"), false);
    }
    cb(null, true);
  },
});

router.get("/s/:token", accessShareLink);

router.use(protect);

router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getMyFiles);
router.get("/download/:id", downloadFile);
router.delete("/:id", deleteFile);
router.put("/:id/star", toggleStar);
router.post("/:id/share", shareWithUser);
router.post("/:id/share-link", generateShareLink);
router.get("/:id/logs", getFileLogs);

module.exports = router;
