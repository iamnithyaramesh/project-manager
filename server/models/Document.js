const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'txt', 'md']
  },
  extractedText: {
    type: String,
    required: true
  },
  textLength: {
    type: Number,
    required: true
  },
  requirements: [{
    type: String
  }],
  extractedTasks: [{
    number: Number,
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    estimatedHours: Number,
    skillsRequired: [String],
    source: {
      type: String,
      default: 'pdf_extraction'
    }
  }],
  metadata: {
    pages: Number,
    info: mongoose.Schema.Types.Mixed,
    warnings: [String],
    encoding: String,
    wordCount: Number,
    characterCount: Number,
    hasRequirements: Boolean,
    taskCount: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  status: {
    type: String,
    enum: ['processed', 'analyzing', 'error'],
    default: 'processed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
