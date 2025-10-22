const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { auth } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// Upload and parse document
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';

    try {
      if (fileExtension === '.pdf') {
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        extractedText = pdfData.text;
      } else if (fileExtension === '.docx') {
        const docxBuffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: docxBuffer });
        extractedText = result.value;
      } else if (fileExtension === '.txt') {
        extractedText = fs.readFileSync(filePath, 'utf8');
      } else {
        return res.status(400).json({ message: 'Unsupported file type' });
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        filename: req.file.originalname,
        text: extractedText,
        length: extractedText.length
      });
    } catch (parseError) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Parse email content
router.post('/parse-email', auth, async (req, res) => {
  try {
    const { subject, body, from } = req.body;
    
    // Combine email components
    const emailContent = `
      From: ${from}
      Subject: ${subject}
      Body: ${body}
    `;

    res.json({
      content: emailContent,
      metadata: {
        from,
        subject,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;




