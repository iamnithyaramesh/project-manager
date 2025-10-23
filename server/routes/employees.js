const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const { auth, requireRole } = require('../middleware/auth');

// Get all employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ['employee', 'team_lead', 'admin'] } })
      .select('-password')
      .sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new employee
router.post('/', auth, requireRole('admin', 'team_lead'), async (req, res) => {
  try {
    const { name, email, password, role, department, skills, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // Create new employee
    const employee = new User({
      name,
      email,
      password,
      role: role || 'employee',
      department,
      skills: skills || [],
      phone,
      address,
      isActive: true
    });

    await employee.save();
    
    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;
    
    res.status(201).json(employeeResponse);
  } catch (error) {
    console.error('Error creating employee:', error);
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

    // Get active tasks
    const activeTasks = await Task.find({ 
      assignedTo: req.params.id,
      status: { $ne: 'completed' }
    });

    res.json({
      employee,
      activeTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', auth, requireRole('admin', 'team_lead'), async (req, res) => {
  try {
    const { name, email, role, department, skills, phone, address, isActive } = req.body;
    
    const updateData = {
      name,
      email,
      role,
      department,
      skills: skills || [],
      phone,
      address,
      isActive
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const employee = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee has active tasks
    const activeTasks = await Task.find({ 
      assignedTo: req.params.id,
      status: { $ne: 'completed' }
    });

    if (activeTasks.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete employee with ${activeTasks.length} active tasks. Please reassign or complete tasks first.` 
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get employee performance
router.get('/:id/performance', auth, async (req, res) => {
  try {
    // Get completed tasks for performance metrics
    const completedTasks = await Task.find({ 
      assignedTo: req.params.id,
      status: 'completed'
    }).populate('projectId', 'name');

    const performance = {
      totalTasksCompleted: completedTasks.length,
      totalHoursWorked: completedTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
      averageRating: 3.5, // Default rating
      recentTasks: completedTasks.slice(0, 5)
    };
    
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




