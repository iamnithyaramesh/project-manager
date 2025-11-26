const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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
  estimatedHours: { type: Number, default: null },
  actualHours: { type: Number, default: 0 },
  startDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  skillsRequired: [{ type: String }],
  // Jira integration fields
  jiraIssueKey: { type: String, index: true, default: null },
  jiraUrl: { type: String, default: null },
  jiraSyncedAt: { type: Date, default: null },
  tags: [{ type: String }],
  notes: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
