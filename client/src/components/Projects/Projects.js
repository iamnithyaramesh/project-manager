import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash, FiCalendar, FiUpload } from 'react-icons/fi';
import './Projects.css';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    status: 'planning'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      if (editingProject) {
        await axios.put(`http://localhost:5000/api/projects/${editingProject._id}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5000/api/projects', formData, { headers });
      }
      setShowModal(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', priority: 'medium', status: 'planning' });
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please check console for details.');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      priority: project.priority,
      status: project.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token') || 'mock-token';
        await axios.delete(`http://localhost:5000/api/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please check console for details.');
      }
    }
  };

  const handleNewProject = () => {
    // Redirect to documents page for PDF upload or email parsing
    navigate('/app/documents');
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#6b7280',
      active: '#3b82f6',
      on_hold: '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
      </div>

      {/* Existing Projects */}
      <div className="existing-projects-section">
        <h2>Existing Projects</h2>
        <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <div className="project-header">
              <h3>{project.name}</h3>
              <div className="project-actions">
                <button onClick={() => handleEdit(project)} className="icon-btn">
                  <FiEdit />
                </button>
                <button onClick={() => handleDelete(project._id)} className="icon-btn delete">
                  <FiTrash />
                </button>
              </div>
            </div>
            <p className="project-description">{project.description}</p>
            <div className="project-meta">
              <span className="status" style={{ backgroundColor: getStatusColor(project.status) }}>
                {project.status}
              </span>
              <span className={`priority priority-${project.priority}`}>
                {project.priority}
              </span>
            </div>
            {project.clientId && (
              <div className="project-client">
                <strong>Client:</strong> {project.clientId.name}
              </div>
            )}
          </div>
        ))}
        </div>
      </div>
            {/* Project Creation Options */}
            <div className="project-creation-section">
        <h2>Add a New Project</h2>
        <p className="creation-subtitle">Choose how you'd like to add your project</p>
        <div className="creation-options">
          <button className="creation-option primary" onClick={handleNewProject}>
            <div className="option-icon">
              <FiUpload />
            </div>
            <h3>Upload SRS Document</h3>
            <p>Upload PDF, Word, or email content to automatically create a project</p>
          </button>
          <button className="creation-option secondary" onClick={() => setShowModal(true)}>
            <div className="option-icon">
              <FiPlus />
            </div>
            <h3>Add Manually</h3>
            <p>Fill out the project details manually</p>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProject ? 'Edit Project' : 'Create Project Manually'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;




