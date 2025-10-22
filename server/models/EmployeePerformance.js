const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  quality: {
    type: String,
    enum: ['excellent', 'good', 'satisfactory', 'needs_improvement'],
    default: 'satisfactory'
  },
  completedOnTime: {
    type: Boolean,
    default: true
  },
  review: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const employeeProfileSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalTasksCompleted: {
    type: Number,
    default: 0
  },
  totalHoursWorked: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  skillsDeveloped: [{
    skill: String,
    proficiency: Number,
    lastUpdated: Date
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  currentProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  performanceHistory: [performanceSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmployeePerformance', employeeProfileSchema);




