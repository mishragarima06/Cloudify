const axios = require("axios");

// Simple classification based on MIME type
const classifyByMimeType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("word") ||
    mimeType.includes("text")
  )
    return "document";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return "spreadsheet";
  if (
    mimeType.includes("javascript") ||
    mimeType.includes("python") ||
    mimeType.includes("json") ||
    mimeType.includes("xml")
  )
    return "code";
  return "other";
};

// Call Python Flask AI service for advanced classification
// If Flask is not running, falls back to MIME type classification
const classifyWithAI = async (fileBuffer, mimeType, fileName) => {
  try {
    const FormData = require("form-data");
    const form = new FormData();
    form.append("file", fileBuffer, { filename: fileName, contentType: mimeType });

    const response = await axios.post(
      `${process.env.FLASK_AI_URL}/classify`,
      form,
      { headers: form.getHeaders(), timeout: 5000 }
    );

    return {
      category: response.data.category || classifyByMimeType(mimeType),
      tags: response.data.tags || [],
      summary: response.data.summary || null,
    };
  } catch (error) {
    // Flask not available — use MIME type fallback
    console.log("⚠️  AI service unavailable, using MIME fallback");
    return {
      category: classifyByMimeType(mimeType),
      tags: [],
      summary: null,
    };
  }
};

module.exports = { classifyWithAI, classifyByMimeType };
