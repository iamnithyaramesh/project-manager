const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');

async function extractTextFromFile(filePath, mimetype) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (mimetype === 'application/pdf' || ext === '.pdf') {
      const data = await fs.readFile(filePath);
      const parsed = await pdf(data);
      return parsed.text || '';
    }
    if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }
    // fallback: read as text
    const txt = await fs.readFile(filePath, 'utf8').catch(() => '');
    return txt || '';
  } catch (err) {
    console.warn('extractTextFromFile error:', err.message);
    return '';
  }
}

exports.uploadAndAttach = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { projectId, uploadedBy } = req.body;
    const file = req.file;
    const filePath = file.path;

    const extractedText = await extractTextFromFile(filePath, file.mimetype);

    // create Document record
    const doc = await Document.create({
      filename: file.originalname,
      size: file.size,
      contentType: file.mimetype,
      text: extractedText,
      project: projectId || null,
      uploadedBy: uploadedBy || null
    });

    // cleanup temp file
    await fs.unlink(filePath).catch(() => {});

    res.json({ ok: true, document: doc });
  } catch (err) {
    console.error('uploadAndAttach error:', err);
    res.status(500).json({ error: 'Failed to upload document', details: err.message });
  }
};