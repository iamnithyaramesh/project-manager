import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiRefreshCw, FiTrendingUp, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    employees: 0,
    completedTasks: 0,
    activeTasks: 0,
    inProgressTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [projectsRes, tasksRes, employeesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects', { headers }),
        axios.get('http://localhost:5000/api/tasks', { headers }),
        axios.get('http://localhost:5000/api/employees', { headers })
      ]);

      const tasks = tasksRes.data;
      const projects = projectsRes.data;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const activeTasks = tasks.filter(t => t.status === 'todo').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

      setStats({
        projects: projects.length,
        tasks: tasks.length,
        employees: employeesRes.data.length,
        completedTasks,
        activeTasks,
        inProgressTasks
      });

      // Sort tasks by creation date and get recent ones
      const sortedTasks = tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentTasks(sortedTasks);

      // Sort projects by creation date and get recent ones
      const sortedProjects = projects
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentProjects(sortedProjects);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'active': return '#3498db';
      case 'planning': return '#6b7280';
      case 'on_hold': return '#f39c12';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'in_progress': return '#3498db';
      case 'todo': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{getGreeting()}, {user?.name || 'User'}!</h1>
          <p>Welcome to your project management dashboard</p>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchDashboardData}
            title="Refresh data"
          >
            <FiRefreshCw />
          </button>
          {lastUpdated && (
            <span className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card projects">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.projects}</h3>
            <p>Active Projects</p>
          </div>
        </div>
        
        <div className="stat-card tasks">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{stats.tasks}</h3>
            <p>Total Tasks</p>
            <div className="task-breakdown">
              <span className="breakdown-item">
                <span className="breakdown-dot" style={{ backgroundColor: '#95a5a6' }}></span>
                {stats.activeTasks} To Do
              </span>
              <span className="breakdown-item">
                <span className="breakdown-dot" style={{ backgroundColor: '#3498db' }}></span>
                {stats.inProgressTasks} In Progress
              </span>
            </div>
          </div>
        </div>
        
        <div className="stat-card employees">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.employees}</h3>
            <p>Team Members</p>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.completedTasks}</h3>
            <p>Completed Tasks</p>
            {stats.tasks > 0 && (
              <div className="completion-rate">
                {Math.round((stats.completedTasks / stats.tasks) * 100)}% completion rate
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-projects">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <button 
              className="view-all-btn"
              onClick={() => window.location.href = '/app/projects'}
            >
              View All Projects
            </button>
          </div>
          
          {recentProjects.length > 0 ? (
            <div className="project-list">
              {recentProjects.map(project => (
                <div key={project._id} className="project-item">
                  <div className="project-info">
                    <h4>{project.name}</h4>
                    <p className="project-description">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="project-badges">
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getProjectStatusColor(project.status) }}
                    >
                      {project.status}
                    </span>
                    <span className={`priority-badge priority-${project.priority}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiTrendingUp size={48} />
              <h3>No projects yet</h3>
              <p>Create your first project to get started!</p>
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/app/projects'}
              >
                Create Project
              </button>
            </div>
          )}
        </div>

        <div className="recent-tasks">
          <div className="section-header">
            <h2>Recent Tasks</h2>
            <button 
              className="view-all-btn"
              onClick={() => window.location.href = '/app/tasks'}
            >
              View All Tasks
            </button>
          </div>
          
          {recentTasks.length > 0 ? (
            <div className="task-list">
              {recentTasks.map(task => (
                <div key={task._id} className="task-item">
                  <div 
                    className="task-status-indicator" 
                    style={{ backgroundColor: getTaskStatusColor(task.status) }}
                  ></div>
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p className="task-description">
                      {task.description || 'No description provided'}
                    </p>
                    <div className="task-meta">
                      <span className="task-date">
                        Created: {formatDate(task.createdAt)}
                      </span>
                      {task.estimatedHours && (
                        <span className="task-hours">
                          Est: {task.estimatedHours}h
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-badges">
                    <span 
                      className="priority-badge" 
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                    <span className="status-badge">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiClock size={48} />
              <h3>No tasks yet</h3>
              <p>Create your first task to get started!</p>
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/app/tasks'}
              >
                Create Task
              </button>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => window.location.href = '/app/tasks'}
            >
              <FiClock />
              Manage Tasks
            </button>
            <button 
              className="action-btn"
              onClick={() => window.location.href = '/app/projects'}
            >
              <FiTrendingUp />
              View Projects
            </button>
            <button 
              className="action-btn"
              onClick={() => window.location.href = '/app/employees'}
            >
              <FiUsers />
              Team Members
            </button>
            <button 
              className="action-btn"
              onClick={() => window.location.href = '/app/documents'}
            >
              <FiCheckCircle />
              Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;