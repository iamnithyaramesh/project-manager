const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { auth } = require('../middleware/auth');
const Document = require('../models/Document');

// Multer configuration for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt', '.md'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Supported: .pdf, .docx, .txt, .md'), false);
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to extract requirements from text
const extractRequirements = (text) => {
  const requirements = [];
  const lowerText = text.toLowerCase();
  
  // Technical requirements
  if (lowerText.includes('login') || lowerText.includes('authentication')) requirements.push('User Authentication');
  if (lowerText.includes('dashboard') || lowerText.includes('admin panel')) requirements.push('Dashboard UI');
  if (lowerText.includes('report') || lowerText.includes('analytics')) requirements.push('Report Generation');
  if (lowerText.includes('notification') || lowerText.includes('alert')) requirements.push('Notifications Module');
  if (lowerText.includes('api') || lowerText.includes('integration')) requirements.push('API Integration');
  if (lowerText.includes('mobile') || lowerText.includes('responsive')) requirements.push('Mobile Responsiveness');
  if (lowerText.includes('database') || lowerText.includes('storage')) requirements.push('Database Management');
  if (lowerText.includes('security') || lowerText.includes('encryption')) requirements.push('Security Features');
  if (lowerText.includes('search') || lowerText.includes('filter')) requirements.push('Search Functionality');
  if (lowerText.includes('export') || lowerText.includes('download')) requirements.push('Export Features');
  
  return requirements;
};

// Helper function to extract tasks from text based on numbering
const extractTasksFromText = (text) => {
  const tasks = [];
  
  // Patterns to match numbered tasks
  const patterns = [
    // Pattern 1: 1. Task description
    /^\s*(\d+)\.\s+(.+?)(?=\n\s*\d+\.|$)/gms,
    // Pattern 2: 1) Task description  
    /^\s*(\d+)\)\s+(.+?)(?=\n\s*\d+\)|$)/gms,
    // Pattern 3: - 1. Task description
    /^\s*-\s*(\d+)\.\s+(.+?)(?=\n\s*-\s*\d+\.|$)/gms,
    // Pattern 4: * 1. Task description
    /^\s*\*\s*(\d+)\.\s+(.+?)(?=\n\s*\*\s*\d+\.|$)/gms,
    // Pattern 5: Task 1: description
    /Task\s+(\d+):\s*(.+?)(?=Task\s+\d+:|$)/gms,
    // Pattern 6: Step 1: description
    /Step\s+(\d+):\s*(.+?)(?=Step\s+\d+:|$)/gms
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const taskNumber = parseInt(match[1]);
      const taskDescription = match[2].trim();
      
      // Skip if task description is too short or contains only numbers
      if (taskDescription.length < 10 || /^\d+$/.test(taskDescription)) {
        continue;
      }
      
      // Extract priority from description
      let priority = 'medium';
      const lowerDesc = taskDescription.toLowerCase();
      if (lowerDesc.includes('urgent') || lowerDesc.includes('critical') || lowerDesc.includes('high priority')) {
        priority = 'high';
      } else if (lowerDesc.includes('low priority') || lowerDesc.includes('optional')) {
        priority = 'low';
      }
      
      // Extract estimated time if mentioned
      let estimatedHours = null;
      const timeMatch = taskDescription.match(/(\d+)\s*(hours?|hrs?|h)/i);
      if (timeMatch) {
        estimatedHours = parseInt(timeMatch[1]);
      }
      
      // Extract skills if mentioned
      const skills = [];
      const skillKeywords = ['frontend', 'backend', 'database', 'api', 'ui', 'ux', 'testing', 'deployment'];
      skillKeywords.forEach(skill => {
        if (lowerDesc.includes(skill)) {
          skills.push(skill);
        }
      });
      
      tasks.push({
        number: taskNumber,
        title: taskDescription.length > 100 ? taskDescription.substring(0, 100) + '...' : taskDescription,
        description: taskDescription,
        priority: priority,
        estimatedHours: estimatedHours,
        skillsRequired: skills,
        source: 'pdf_extraction'
      });
    }
  });
  
  // Remove duplicates based on description similarity
  const uniqueTasks = [];
  tasks.forEach(task => {
    const isDuplicate = uniqueTasks.some(existing => 
      existing.description.toLowerCase().includes(task.description.toLowerCase().substring(0, 50)) ||
      task.description.toLowerCase().includes(existing.description.toLowerCase().substring(0, 50))
    );
    if (!isDuplicate) {
      uniqueTasks.push(task);
    }
  });
  
  return uniqueTasks.sort((a, b) => a.number - b.number);
};

// Upload and extract document
router.post('/upload', auth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Document upload request received');
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileExt = path.extname(originalName).toLowerCase();
    const fileType = fileExt.substring(1); // Remove the dot from extension
    
    console.log('File details:', { filePath, originalName, fileExt, fileType });
    
    let extractedText = '';

    try {
      if (fileExt === '.pdf') {
        console.log('Processing PDF file...');
        const data = await fs.promises.readFile(filePath);
        
        try {
          const parsed = await pdf(data);
          extractedText = parsed.text || '';
          console.log('PDF parsed successfully, text length:', extractedText.length);
        } catch (pdfError) {
          console.error('PDF parsing failed:', pdfError.message);
          console.log('PDF appears to be corrupted or has encoding issues. Skipping fallback text parsing.');
          throw new Error('Unable to parse PDF file. The file may be corrupted, password-protected, or have unsupported encoding. Please try a different PDF file or convert it to a text file.');
        }
      } else if (fileExt === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value || '';
      } else if (fileExt === '.txt' || fileExt === '.md') {
        extractedText = await fs.promises.readFile(filePath, 'utf8');
      } else {
        return res.status(400).json({ message: 'Unsupported file type' });
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Parse error details:', parseError.message);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to parse file content';
      if (parseError.message.includes('Invalid number')) {
        errorMessage = 'The PDF file appears to be corrupted or has an unsupported format. Please try a different PDF file.';
      } else if (parseError.message.includes('password')) {
        errorMessage = 'The PDF file is password-protected. Please provide an unprotected PDF file.';
      } else if (parseError.message.includes('Invalid PDF')) {
        errorMessage = 'The file is not a valid PDF or is corrupted. Please check the file and try again.';
      }
      
      return res.status(500).json({ 
        message: errorMessage,
        details: parseError.message 
      });
    } finally {
      // Clean up uploaded file
      try {
        await fs.promises.unlink(filePath);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    // Clean and process text
    extractedText = extractedText
      .replace(/\r/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    // Filter out PDF metadata and structure if present
    if (extractedText.includes('%PDF-') || extractedText.includes('obj') || extractedText.includes('endobj')) {
      console.log('Detected PDF structure in text - filtering out metadata');
      extractedText = extractedText
        .replace(/%PDF-.*?\n/g, '')
        .replace(/\d+\s+\d+\s+obj.*?endobj/gs, '')
        .replace(/xref.*?startxref/gs, '')
        .replace(/trailer.*?%%EOF/gs, '')
        .replace(/stream.*?endstream/gs, '')
        .replace(/<<.*?>>/gs, '')
        .replace(/\/[A-Za-z]+\s+\d+/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Check if we have valid text content
    if (!extractedText || extractedText.length < 10) {
      console.log('No meaningful text extracted from file');
      return res.status(400).json({ 
        message: 'No readable text found in the uploaded file. Please ensure the file contains text content.' 
      });
    }
    
    console.log('Text processing completed, final length:', extractedText.length);

    // Extract requirements
    const requirements = extractRequirements(extractedText);
    console.log('Extracted requirements:', requirements.length);
    
    // Extract tasks from the document
    const extractedTasks = extractTasksFromText(extractedText);
    console.log('Extracted tasks:', extractedTasks.length);

    // Save to MongoDB
    const document = new Document({
      filename: originalName,
      originalName: originalName,
      fileSize: req.file.size,
      fileType: fileType, // Use fileType without dot
      extractedText: extractedText,
      textLength: extractedText.length,
      requirements: requirements,
      extractedTasks: extractedTasks,
      metadata: {
        wordCount: extractedText.split(' ').length,
        characterCount: extractedText.length,
        hasRequirements: requirements.length > 0,
        taskCount: extractedTasks.length
      },
      uploadedBy: req.user.id,
      status: 'processed'
    });

    await document.save();
    console.log('Document saved successfully:', document._id);

    res.json({
      id: document._id,
      text: extractedText,
      filename: originalName,
      size: req.file.size,
      requirements: requirements,
      extractedTasks: extractedTasks,
      message: 'Document processed successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all documents for a user
router.get('/documents', auth, async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user.id })
      .populate('uploadedBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific document by ID
router.get('/documents/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('projectId', 'name');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to this document
    if (document.uploadedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a document
router.delete('/documents/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to this document
    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create tasks from extracted tasks
router.post('/create-tasks-from-document', auth, async (req, res) => {
  try {
    const { documentId, projectId, selectedTasks } = req.body;
    
    if (!documentId || !projectId) {
      return res.status(400).json({ message: 'Document ID and Project ID are required' });
    }

    // Get the document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to this document
    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const Task = require('../models/Task');
    const createdTasks = [];

    // If specific tasks are selected, create only those
    if (selectedTasks && selectedTasks.length > 0) {
      for (const taskData of selectedTasks) {
        const task = new Task({
          title: taskData.title,
          description: taskData.description,
          projectId: projectId,
          priority: taskData.priority || 'medium',
          status: 'todo',
          estimatedHours: taskData.estimatedHours,
          skillsRequired: taskData.skillsRequired || [],
          assignedBy: req.user.id,
          source: 'pdf_extraction'
        });

        await task.save();
        createdTasks.push(task);
      }
    } else {
      // Create all extracted tasks
      for (const extractedTask of document.extractedTasks) {
        const task = new Task({
          title: extractedTask.title,
          description: extractedTask.description,
          projectId: projectId,
          priority: extractedTask.priority,
          status: 'todo',
          estimatedHours: extractedTask.estimatedHours,
          skillsRequired: extractedTask.skillsRequired,
          assignedBy: req.user.id,
          source: 'pdf_extraction'
        });

        await task.save();
        createdTasks.push(task);
      }
    }

    res.json({
      message: `Successfully created ${createdTasks.length} tasks`,
      tasks: createdTasks,
      count: createdTasks.length
    });

  } catch (error) {
    console.error('Error creating tasks from document:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;