import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    employees: 0,
    completedTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, employeesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/projects'),
        axios.get('http://localhost:5000/api/tasks'),
        axios.get('http://localhost:5000/api/employees')
      ]);

      const completedTasks = tasksRes.data.filter(t => t.status === 'completed').length;

      setStats({
        projects: projectsRes.data.length,
        tasks: tasksRes.data.length,
        employees: employeesRes.data.length,
        completedTasks
      });

      setRecentTasks(tasksRes.data.slice(0, 5));
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{getGreeting()}, {user?.name}!</h1>
        <p>Welcome to your project management dashboard</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon projects">📁</div>
          <div className="stat-content">
            <h3>{stats.projects}</h3>
            <p>Total Projects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon tasks">✓</div>
          <div className="stat-content">
            <h3>{stats.tasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon employees">👥</div>
          <div className="stat-content">
            <h3>{stats.employees}</h3>
            <p>Team Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">🎯</div>
          <div className="stat-content">
            <h3>{stats.completedTasks}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-tasks">
          <h2>Recent Tasks</h2>
          {recentTasks.length > 0 ? (
            <div className="task-list">
              {recentTasks.map(task => (
                <div key={task._id} className="task-item">
                  <div className="task-status" data-status={task.status}></div>
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                  </div>
                  <div className="task-meta">
                    <span className={`priority priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;




