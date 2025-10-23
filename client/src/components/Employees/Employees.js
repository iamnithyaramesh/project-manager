import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiBriefcase, FiStar, FiPlus, FiEdit, FiTrash, FiSave, FiX } from 'react-icons/fi';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    skills: [],
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    isActive: true
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const response = await axios.get('http://localhost:5000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const token = localStorage.getItem('token') || 'mock-token';
      const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedEmployee(response.data.employee);
      setPerformance(response.data.performance);
    } catch (error) {
      console.error('Error fetching employee details:', error);
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

      if (editingEmployee) {
        await axios.put(`http://localhost:5000/api/employees/${editingEmployee._id}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5000/api/employees', formData, { headers });
      }

      setShowModal(false);
      setEditingEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        skills: [],
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        isActive: true
      });
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      role: employee.role,
      department: employee.department || '',
      skills: employee.skills || [],
      phone: employee.phone || '',
      address: employee.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      isActive: employee.isActive !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token') || 'mock-token';
        await axios.delete(`http://localhost:5000/api/employees/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee');
      }
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#ef4444',
      team_lead: '#3b82f6',
      employee: '#10b981',
      client: '#f59e0b'
    };
    return colors[role] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employees</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Employee
        </button>
      </div>

      <div className="employees-content">
        <div className="employees-list">
          {employees.map(employee => (
            <div
              key={employee._id}
              className="employee-card"
            >
              <div className="employee-avatar" onClick={() => fetchEmployeeDetails(employee._id)}>
                <FiUser size={30} />
              </div>
              <div className="employee-info" onClick={() => fetchEmployeeDetails(employee._id)}>
                <h3>{employee.name}</h3>
                <p className="employee-email">
                  <FiMail size={14} /> {employee.email}
                </p>
                <div className="employee-meta">
                  <span className="role-badge" style={{ backgroundColor: getRoleColor(employee.role) }}>
                    {employee.role}
                  </span>
                  {employee.department && (
                    <span className="department">
                      <FiBriefcase size={14} /> {employee.department}
                    </span>
                  )}
                </div>
                {employee.skills && employee.skills.length > 0 && (
                  <div className="employee-skills">
                    {employee.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                    {employee.skills.length > 3 && (
                      <span className="skill-tag">+{employee.skills.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="employee-actions">
                <button 
                  onClick={() => handleEdit(employee)}
                  className="action-btn edit"
                  title="Edit employee"
                >
                  <FiEdit />
                </button>
                <button 
                  onClick={() => handleDelete(employee._id)}
                  className="action-btn delete"
                  title="Delete employee"
                >
                  <FiTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedEmployee && (
          <div className="employee-details">
            <div className="details-header">
              <h2>{selectedEmployee.name}</h2>
              <button onClick={() => setSelectedEmployee(null)}>✕</button>
            </div>
            <div className="details-content">
              <div className="detail-section">
                <h3>Profile Information</h3>
                <div className="detail-item">
                  <strong>Email:</strong> {selectedEmployee.email}
                </div>
                <div className="detail-item">
                  <strong>Role:</strong> {selectedEmployee.role}
                </div>
                {selectedEmployee.department && (
                  <div className="detail-item">
                    <strong>Department:</strong> {selectedEmployee.department}
                  </div>
                )}
                {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                  <div className="detail-item">
                    <strong>Skills:</strong>
                    <div className="skills-list">
                      {selectedEmployee.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {performance && (
                <div className="detail-section">
                  <h3>Performance</h3>
                  <div className="detail-item">
                    <strong>Total Tasks Completed:</strong> {performance.totalTasksCompleted || 0}
                  </div>
                  <div className="detail-item">
                    <strong>Total Hours Worked:</strong> {performance.totalHoursWorked || 0}
                  </div>
                  <div className="detail-item">
                    <strong>Average Rating:</strong>
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <FiStar
                          key={star}
                          fill={star <= (performance.averageRating || 0) ? '#fbbf24' : 'none'}
                          color="#fbbf24"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedEmployee.currentProjects && selectedEmployee.currentProjects.length > 0 && (
                <div className="detail-section">
                  <h3>Current Projects</h3>
                  <ul>
                    {selectedEmployee.currentProjects.map((project, idx) => (
                      <li key={idx}>{project}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowModal(false);
                  setEditingEmployee(null);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'employee',
                    department: '',
                    skills: [],
                    phone: '',
                    address: {
                      street: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      country: ''
                    },
                    isActive: true
                  });
                }}
              >
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="employee-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter employee name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              {!editingEmployee && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingEmployee}
                    placeholder="Enter password"
                  />
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="form-group">
                <label>Skills</label>
                <div className="skills-input">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button type="button" onClick={addSkill} className="btn-secondary">
                    <FiPlus />
                  </button>
                </div>
                <div className="skills-list">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>
                        <FiX />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <div className="address-fields">
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, street: e.target.value }
                    })}
                    placeholder="Street address"
                  />
                  <div className="form-row">
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, city: e.target.value }
                      })}
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, state: e.target.value }
                      })}
                      placeholder="State"
                    />
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, zipCode: e.target.value }
                      })}
                      placeholder="ZIP Code"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, country: e.target.value }
                    })}
                    placeholder="Country"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active Employee
                </label>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave className="me-2" />
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;




