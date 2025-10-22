import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiFolder, FiCheckSquare, FiUsers, FiFileText, FiSettings, FiLogOut } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <h2>Project Manager</h2>
      </div>
      <ul className="navbar-menu">
        <li>
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <FiHome /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/projects" className={isActive('/projects') ? 'active' : ''}>
            <FiFolder /> Projects
          </Link>
        </li>
        <li>
          <Link to="/tasks" className={isActive('/tasks') ? 'active' : ''}>
            <FiCheckSquare /> Tasks
          </Link>
        </li>
        <li>
          <Link to="/employees" className={isActive('/employees') ? 'active' : ''}>
            <FiUsers /> Employees
          </Link>
        </li>
        <li>
          <Link to="/documents" className={isActive('/documents') ? 'active' : ''}>
            <FiFileText /> Documents
          </Link>
        </li>
        <li>
          <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>
            <FiSettings /> Settings
          </Link>
        </li>
      </ul>
      <div className="navbar-footer">
        <div className="user-info">
          <span>{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;




