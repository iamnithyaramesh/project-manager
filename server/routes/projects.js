const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { auth, requireRole } = require('../middleware/auth');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching projects for user:', req.user.id);
    
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.id },
        { 'teamMembers.userId': req.user.id }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('clientId', 'name email')
      .populate('teamMembers.userId', 'name email role skills')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching project:', req.params.id);
    
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('clientId', 'name email')
      .populate('teamMembers.userId', 'name email role skills');
    
    if (!project) {
      console.log('Project not found:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess = project.createdBy._id.toString() === req.user.id || 
                     project.teamMembers.some(member => member.userId._id.toString() === req.user.id);
    
    if (!hasAccess) {
      console.log('Access denied for user:', req.user.id);
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    console.log('User ID:', req.user.id);
    
    const projectData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const project = new Project(projectData);
    console.log('Project to save:', project);
    
    await project.save();
    console.log('Project saved successfully:', project._id);
    
    // Populate the saved project
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('clientId', 'name email')
      .populate('teamMembers.userId', 'name email role skills');
    
    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating project:', req.params.id, 'with data:', req.body);
    console.log('User ID:', req.user.id);
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      console.log('Project not found:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('Found project:', project.name, 'Created by:', project.createdBy);

    // Check if user has permission to update this project
    const hasAccess = project.createdBy.toString() === req.user.id || 
                     (project.teamMembers && project.teamMembers.some(member => member.userId.toString() === req.user.id));
    
    console.log('Has access:', hasAccess);
    
    if (!hasAccess) {
      console.log('Access denied for user:', req.user.id);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update the project
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        project[key] = req.body[key];
        console.log(`Updated ${key}:`, req.body[key]);
      }
    });
    
    project.updatedAt = new Date();
    await project.save();
    
    console.log('Project updated successfully:', project._id);

    // Populate the updated project
    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('clientId', 'name email')
      .populate('teamMembers.userId', 'name email role skills');
    
    console.log('Returning updated project:', updatedProject.name);
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting project:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      console.log('Project not found:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to delete this project (only creator or admin)
    if (project.createdBy.toString() !== req.user.id) {
      console.log('Access denied for user:', req.user.id);
      return res.status(403).json({ message: 'Access denied' });
    }

    await Project.findByIdAndDelete(req.params.id);
    console.log('Project deleted successfully:', req.params.id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get project statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    console.log('Fetching project stats for user:', req.user.id);
    
    const userId = req.user.id;
    
    const stats = await Project.aggregate([
      {
        $match: {
          $or: [
            { createdBy: userId },
            { 'teamMembers.userId': userId }
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
      planning: 0,
      active: 0,
      completed: 0,
      on_hold: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    console.log('Project stats:', formattedStats);
    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add team member to project
router.post('/:id/team-members', auth, async (req, res) => {
  try {
    console.log('Adding team member to project:', req.params.id);
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to add team members
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId, role, responsibilities } = req.body;
    
    // Check if user is already a team member
    const existingMember = project.teamMembers.find(member => 
      member.userId.toString() === userId
    );
    
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    project.teamMembers.push({
      userId,
      role,
      responsibilities,
      addedAt: new Date()
    });

    await project.save();
    
    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('clientId', 'name email')
      .populate('teamMembers.userId', 'name email role skills');
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove team member from project
router.delete('/:id/team-members/:memberId', auth, async (req, res) => {
  try {
    console.log('Removing team member from project:', req.params.id, req.params.memberId);
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has permission to remove team members
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    project.teamMembers = project.teamMembers.filter(member => 
      member._id.toString() !== req.params.memberId
    );

    await project.save();
    
    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('clientId', 'name email')
      .populate('teamMembers.userId', 'name email role skills');
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;