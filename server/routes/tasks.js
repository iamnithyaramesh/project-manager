const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const EmployeePerformance = require('../models/EmployeePerformance');
const { auth, requireRole } = require('../middleware/auth');

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { projectId, assignedTo, status } = req.query;
    const filter = {};
    
    if (projectId) filter.projectId = projectId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email role skills')
      .populate('assignedBy', 'name')
      .sort({ aiPriorityScore: -1, createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email role skills')
      .populate('assignedBy', 'name');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      assignedBy: req.user._id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete task
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'completed';
    task.completedAt = Date.now();
    task.actualHours = req.body.actualHours || task.actualHours;
    await task.save();

    // Update employee performance
    if (task.assignedTo) {
      const performance = new EmployeePerformance({
        employeeId: task.assignedTo,
        taskId: task._id,
        projectId: task.projectId,
        hoursWorked: task.actualHours,
        completedOnTime: task.dueDate ? task.completedAt <= task.dueDate : true
      });
      await performance.save();
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, requireRole('admin', 'team_lead'), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;




