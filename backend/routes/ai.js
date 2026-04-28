const express = require("express");
const router = express.Router();

router.post("/classify", (req, res) => {
  res.json({ category: "Document", confidence: 0.95 });
});

router.post("/tags", (req, res) => {
  res.json({ tags: ["important", "mock", "data"] });
});

router.post("/summary", (req, res) => {
  res.json({ summary: "This is a mock summary of the document." });
});

router.post("/virus-scan", (req, res) => {
  res.json({ isClean: true, details: "Mock virus scan completed." });
});

router.post("/search", (req, res) => {
  res.json({ results: [] });
});

module.exports = router;
