const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload  (multipart/form-data, field "image")
// Used by the Shop Owner app to upload product images to Cloudinary.
router.post("/", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const folder = req.body.folder || "asf-shopee/products";

  const stream = cloudinary.uploader.upload_stream(
    { folder, resource_type: "image" },
    (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ url: result.secure_url, publicId: result.public_id });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

module.exports = router;
