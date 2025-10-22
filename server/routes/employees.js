const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EmployeePerformance = require('../models/EmployeePerformance');
const Task = require('../models/Task');
const { auth, requireRole } = require('../middleware/auth');

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ['employee', 'team_lead'] } })
      .select('-password')
      .sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee details
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get performance data
    const performance = await EmployeePerformance.findOne({ employeeId: req.params.id });
    
    // Get active tasks
    const activeTasks = await Task.find({ 
      assignedTo: req.params.id,
      status: { $ne: 'completed' }
    });

    res.json({
      employee,
      performance,
      activeTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', auth, requireRole('admin', 'team_lead'), async (req, res) => {
  try {
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee performance
router.get('/:id/performance', auth, async (req, res) => {
  try {
    const performance = await EmployeePerformance.findOne({ employeeId: req.params.id })
      .populate('taskId', 'title description')
      .populate('projectId', 'name')
      .sort({ completedAt: -1 });
    
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available employees for task assignment
router.get('/available/list', auth, async (req, res) => {
  try {
    const { skills, hours, startDate, endDate } = req.query;
    
    let query = { 
      role: { $in: ['employee', 'team_lead'] },
      availability: true 
    };

    if (skills) {
      query.skills = { $in: skills.split(',') };
    }

    const employees = await User.find(query).select('-password');
    
    // Filter by availability if dates provided
    let availableEmployees = employees;
    if (startDate && endDate) {
      // TODO: Check Google Calendar for conflicts
      // For now, return all employees
    }

    res.json(availableEmployees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;




