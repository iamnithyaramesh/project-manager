import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiFolder, FiCheckSquare, FiUsers, FiFileText, FiMail, FiSettings, FiLogOut } from 'react-icons/fi';
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
        <h2>Proj-Space</h2>
      </div>
      <ul className="navbar-menu">
        <li>
          <Link to="/app" className={isActive('/app') ? 'active' : ''}>
            <FiHome /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/app/projects" className={isActive('/app/projects') ? 'active' : ''}>
            <FiFolder /> Projects
          </Link>
        </li>
        <li>
          <Link to="/app/tasks" className={isActive('/app/tasks') ? 'active' : ''}>
            <FiCheckSquare /> Tasks
          </Link>
        </li>
        <li>
          <Link to="/app/employees" className={isActive('/app/employees') ? 'active' : ''}>
            <FiUsers /> Employees
          </Link>
        </li>
        <li>
          <Link to="/app/documents" className={isActive('/app/documents') ? 'active' : ''}>
            <FiFileText /> Documents
          </Link>
        </li>
        
        <li>
          <Link to="/app/settings" className={isActive('/app/settings') ? 'active' : ''}>
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




