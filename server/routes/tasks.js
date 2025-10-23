const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching tasks for user:', req.user.id);
    
    const tasks = await Task.find({ 
      $or: [
        { assignedTo: req.user.id },
        { assignedBy: req.user.id }
      ]
    })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating task with data:', req.body);
    console.log('User ID:', req.user.id);
    
    const taskData = {
      ...req.body,
      assignedBy: req.user.id
    };
    
    const task = new Task(taskData);
    console.log('Task to save:', task);
    
    await task.save();
    console.log('Task saved successfully:', task._id);
    
    // Populate the saved task
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating task:', req.params.id, 'with data:', req.body);
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to update this task
    if (task.assignedBy.toString() !== req.user.id && task.assignedTo.toString() !== req.user.id) {
      console.log('Access denied for user:', req.user.id);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the task
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        task[key] = req.body[key];
      }
    });

    await task.save();
    console.log('Task updated successfully:', task._id);

    // Populate the updated task
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name');

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting task:', req.params.id);
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to delete this task
    if (task.assignedBy.toString() !== req.user.id) {
      console.log('Access denied for user:', req.user.id);
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);
    console.log('Task deleted successfully:', req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark task as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    console.log('Completing task:', req.params.id);
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to complete this task
    if (task.assignedTo.toString() !== req.user.id && task.assignedBy.toString() !== req.user.id) {
      console.log('Access denied for user:', req.user.id);
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    console.log('Task completed successfully:', task._id);

    // Populate the completed task
    const completedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name');

    res.json(completedTask);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark task as completed and delete it
router.post('/:id/complete-and-delete', auth, async (req, res) => {
  try {
    console.log('Completing and deleting task:', req.params.id);
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      console.log('Task not found:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to complete and delete this task
    if (task.assignedTo.toString() !== req.user.id && task.assignedBy.toString() !== req.user.id) {
      console.log('Access denied for user:', req.user.id);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as completed first
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    // Then delete it
    await Task.findByIdAndDelete(req.params.id);
    
    console.log('Task completed and deleted successfully:', req.params.id);
    res.json({ message: 'Task completed and deleted successfully' });
  } catch (error) {
    console.error('Error completing and deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get completed tasks
router.get('/completed', auth, async (req, res) => {
  try {
    console.log('Fetching completed tasks for user:', req.user.id);
    
    const tasks = await Task.find({ 
      status: 'completed',
      $or: [
        { assignedTo: req.user.id },
        { assignedBy: req.user.id }
      ]
    })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name')
      .sort({ completedAt: -1 });

    console.log(`Found ${tasks.length} completed tasks`);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete all completed tasks (admin/team lead only)
router.delete('/completed/cleanup', auth, requireRole('admin', 'team_lead'), async (req, res) => {
  try {
    console.log('Cleaning up completed tasks for user:', req.user.id);
    
    const result = await Task.deleteMany({ 
      status: 'completed',
      $or: [
        { assignedTo: req.user.id },
        { assignedBy: req.user.id }
      ]
    });

    console.log(`Deleted ${result.deletedCount} completed tasks`);
    res.json({ 
      message: `Deleted ${result.deletedCount} completed tasks`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up completed tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get task statistics
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('Fetching task stats for user:', req.user.id);
    
    const userId = req.user.id;
    
    const stats = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignedTo: userId },
            { assignedBy: userId }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      todo: 0,
      in_progress: 0,
      completed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    console.log('Task stats:', formattedStats);
    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get tasks by project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    console.log('Fetching tasks for project:', req.params.projectId);
    
    const tasks = await Task.find({ 
      projectId: req.params.projectId,
      $or: [
        { assignedTo: req.user.id },
        { assignedBy: req.user.id }
      ]
    })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    console.log(`Found ${tasks.length} tasks for project ${req.params.projectId}`);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get tasks by employee
router.get('/employee/:employeeId', auth, async (req, res) => {
  try {
    console.log('Fetching tasks for employee:', req.params.employeeId);
    
    const tasks = await Task.find({ 
      assignedTo: req.params.employeeId,
      $or: [
        { assignedTo: req.user.id },
        { assignedBy: req.user.id }
      ]
    })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    console.log(`Found ${tasks.length} tasks for employee ${req.params.employeeId}`);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by employee:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;