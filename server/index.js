const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Project Manager API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      employees: '/api/employees',
      documents: '/api/document'
    }
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/document', require('./routes/document'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project-manager')
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 To fix this:');
  console.log('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
  console.log('   2. Start MongoDB service: mongod');
  console.log('   3. Or use MongoDB Atlas cloud service');
  console.log('   4. Update MONGODB_URI in server/.env file');
});

// Test endpoint for PDF parsing
app.get('/api/test-pdf', (req, res) => {
  res.json({ message: 'PDF parsing test endpoint is working', timestamp: new Date() });
});

// Legacy document parsing endpoint (for backward compatibility)
const upload = multer({
  dest: path.join(os.tmpdir(), 'proj-space-uploads')
});

app.post('/api/documents/parse', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname || '').toLowerCase();

  try {
    let text = '';
    if (ext === '.pdf') {
      const data = await fs.readFile(filePath);
      const parsed = await pdf(data);
      text = parsed.text || '';
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value || '';
    } else if (ext === '.txt' || ext === '.md') {
      text = await fs.readFile(filePath, 'utf8');
    } else {
      return res.status(415).json({ error: 'Unsupported file type. Supported: .pdf, .docx, .txt, .md' });
    }

    // strip out excessive whitespace
    text = text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();

    return res.json({ text, filename: req.file.originalname, size: req.file.size });
  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: 'Failed to parse file' });
  } finally {
    // cleanup
    try { await fs.unlink(filePath); } catch (e) { /* ignore */ }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Document parser server running on http://localhost:${PORT}`));