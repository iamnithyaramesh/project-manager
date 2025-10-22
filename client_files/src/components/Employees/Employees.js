import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiBriefcase, FiStar } from 'react-icons/fi';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      setSelectedEmployee(response.data.employee);
      setPerformance(response.data.performance);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
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
      </div>

      <div className="employees-content">
        <div className="employees-list">
          {employees.map(employee => (
            <div
              key={employee._id}
              className="employee-card"
              onClick={() => fetchEmployeeDetails(employee._id)}
            >
              <div className="employee-avatar">
                <FiUser size={30} />
              </div>
              <div className="employee-info">
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
    </div>
  );
};

export default Employees;




