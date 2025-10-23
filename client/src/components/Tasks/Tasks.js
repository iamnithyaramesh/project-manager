import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash, FiCheck, FiUser, FiMoreVertical, FiClock, FiFlag } from 'react-icons/fi';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'medium',
    status: 'todo',
    estimatedHours: ''
  });
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [tasksRes, projectsRes, employeesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks', { headers }),
        axios.get('http://localhost:5000/api/projects', { headers }),
        axios.get('http://localhost:5000/api/employees', { headers })
      ]);
      
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error fetching tasks data:', error);
      // Set empty arrays to prevent UI from breaking
      setTasks([]);
      setProjects([]);
      setEmployees([]);
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

      if (editingTask) {
        await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5000/api/tasks', formData, { headers });
      }

      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        projectId: '',
        assignedTo: '',
        priority: 'medium',
        status: 'todo',
        estimatedHours: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token') || 'mock-token';
        await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleCompleteAndDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to complete and delete this task?')) {
      try {
        const token = localStorage.getItem('token') || 'mock-token';
        await axios.post(`http://localhost:5000/api/tasks/${taskId}/complete-and-delete`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error completing and deleting task:', error);
        alert('Failed to complete and delete task');
      }
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      const token = localStorage.getItem('token') || 'mock-token';
      await axios.put(`http://localhost:5000/api/tasks/${draggedTask._id}`, {
        ...draggedTask,
        status: newStatus
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
    
    setDraggedTask(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getProjectName = (projectId) => {
    if (!projectId) {
      return 'No Project';
    }
    if (typeof projectId === 'object' && projectId.name) {
      return projectId.name;
    }
    const project = projects.find(p => p._id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const getEmployeeName = (employeeId) => {
    if (!employeeId) {
      return 'Unassigned';
    }
    if (typeof employeeId === 'object' && employeeId.name) {
      return employeeId.name;
    }
    const employee = employees.find(e => e._id === employeeId);
    return employee ? employee.name : 'Unassigned';
  };

  const getEmployeeAvatar = (employeeId) => {
    if (!employeeId) {
      return '?';
    }
    if (typeof employeeId === 'object' && employeeId.name) {
      return employeeId.name.charAt(0).toUpperCase();
    }
    const employee = employees.find(e => e._id === employeeId);
    if (employee && employee.name) {
      return employee.name.charAt(0).toUpperCase();
    }
    return '?';
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getTaskCount = (status) => {
    return getTasksByStatus(status).length;
  };

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { id: 'todo', title: 'To Do', color: '#95a5a6' },
    { id: 'in_progress', title: 'In Progress', color: '#3498db' },
    { id: 'completed', title: 'Completed', color: '#27ae60' }
  ];

  return (
    <div className="tasks-page">
      <div className="kanban-header">
        <div className="header-left">
          <h1>Task Board</h1>
          <div className="task-stats">
            <span className="stat-item">
             
              Total: {tasks.length}
            </span>
            <span className="stat-item">
              
              Active: {getTaskCount('todo') + getTaskCount('in_progress')}
            </span>
            <span className="stat-item">
              
              Done: {getTaskCount('completed')}
            </span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Task
        </button>
      </div>

      <div className="kanban-board">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header" style={{ borderTopColor: column.color }}>
              <h3>{column.title}</h3>
              <span className="task-count">{getTaskCount(column.id)}</span>
            </div>
            
            <div className="column-content">
              {getTasksByStatus(column.id).map(task => (
                <div
                  key={task._id}
                  className="task-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                >
                  <div className="task-header">
                    <div className="task-title">{task.title}</div>
                    <div className="task-actions">
                      <button 
                        onClick={() => {
                          setEditingTask(task);
                          setFormData({
                            title: task.title,
                            description: task.description,
                            projectId: typeof task.projectId === 'object' ? task.projectId._id : task.projectId,
                            assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo,
                            priority: task.priority,
                            status: task.status,
                            estimatedHours: task.estimatedHours
                          });
                          setShowModal(true);
                        }} 
                        className="action-btn edit" 
                        title="Edit task"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(task._id)} 
                        className="action-btn delete" 
                        title="Delete task"
                      >
                        <FiTrash />
                      </button>
                    </div>
                  </div>
                  
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  
                  <div className="task-meta">
                    <div className="meta-row">
                      <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                        <FiFlag className="priority-icon" />
                        {task.priority}
                      </span>
                      {task.estimatedHours && (
                        <span className="hours-badge">
                          <FiClock className="hours-icon" />
                          {task.estimatedHours}h
                        </span>
                      )}
                    </div>
                    
                    <div className="meta-row">
                      <span className="project-tag">{getProjectName(task.projectId)}</span>
                      <div className="assignee-avatar" title={getEmployeeName(task.assignedTo)}>
                        {getEmployeeAvatar(task.assignedTo)}
                      </div>
                    </div>
                  </div>
                  
                  {task.status !== 'completed' && (
                    <div className="task-footer">
                      <button 
                        onClick={() => handleCompleteAndDelete(task._id)} 
                        className="complete-delete-btn"
                        title="Complete and delete"
                      >
                        <FiCheck /> Complete & Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {getTasksByStatus(column.id).length === 0 && (
                <div className="empty-column">
                  <p>No tasks in this column</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowModal(false);
                  setEditingTask(null);
                  setFormData({
                    title: '',
                    description: '',
                    projectId: '',
                    assignedTo: '',
                    priority: 'medium',
                    status: 'todo',
                    estimatedHours: ''
                  });
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Project *</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Assign to</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="">Select an employee</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  placeholder="Enter estimated hours"
                  min="0"
                  step="0.5"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;