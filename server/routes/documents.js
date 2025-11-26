const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentsController = require('../controllers/documentsController');

// store uploads in server/uploads (ensure folder exists)
const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// POST /api/documents/upload-with-project
router.post('/upload-with-project', upload.single('file'), documentsController.uploadAndAttach);

module.exports = router;