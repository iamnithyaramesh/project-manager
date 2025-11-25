const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'completed', 'blocked'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  aiPriorityScore: { type: Number, default: null, index: true },
  aiPriorityReason: { type: String, default: null },
  aiPriorityAt: { type: Date, default: null },
  estimatedHours: {
    type: Number
  },
  actualHours: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  skillsRequired: [{
    type: String
  }],
  // --- added fields for Jira integration ---
  jiraIssueKey: { type: String, index: true, default: null },
  jiraUrl: { type: String, default: null },
  jiraSyncedAt: { type: Date, default: null },
  // --- end added fields ---
  tags: [{
    type: String
  }],
  notes: [{
    type: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
  },type: Date,
  updatedAt: {ate.now
    type: Date,
    default: Date.now
  } type: Date,
}); default: Date.now
  }
module.exports = mongoose.model('Task', taskSchema);

module.exports = mongoose.model('Task', taskSchema);

GEMINI_PROVIDER=google
GEMINI_KEY=your_gemini_api_key_here
GEMINI_MODEL=text-bison-001




