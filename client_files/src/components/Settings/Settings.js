import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [jiraConfig, setJiraConfig] = useState({
    email: '',
    apiToken: '',
    baseUrl: '',
    projectKey: ''
  });
  const [calendarToken, setCalendarToken] = useState('');

  const handleJiraSave = () => {
    localStorage.setItem('jiraConfig', JSON.stringify(jiraConfig));
    alert('Jira configuration saved!');
  };

  const handleCalendarConnect = () => {
    // In a real app, this would trigger OAuth flow
    alert('Calendar integration would open OAuth flow here');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Profile</h2>
          <div className="profile-card">
            <div className="profile-info">
              <div className="info-item">
                <strong>Name:</strong> {user?.name}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {user?.email}
              </div>
              <div className="info-item">
                <strong>Role:</strong> {user?.role}
              </div>
              {user?.department && (
                <div className="info-item">
                  <strong>Department:</strong> {user?.department}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Jira Integration</h2>
          <div className="integration-card">
            <p>Connect your Jira account to sync tasks and issues</p>
            <div className="form-group">
              <label>Jira Email</label>
              <input
                type="email"
                value={jiraConfig.email}
                onChange={(e) => setJiraConfig({ ...jiraConfig, email: e.target.value })}
                placeholder="your-email@example.com"
              />
            </div>
            <div className="form-group">
              <label>API Token</label>
              <input
                type="password"
                value={jiraConfig.apiToken}
                onChange={(e) => setJiraConfig({ ...jiraConfig, apiToken: e.target.value })}
                placeholder="Your Jira API token"
              />
            </div>
            <div className="form-group">
              <label>Base URL</label>
              <input
                type="text"
                value={jiraConfig.baseUrl}
                onChange={(e) => setJiraConfig({ ...jiraConfig, baseUrl: e.target.value })}
                placeholder="https://your-domain.atlassian.net"
              />
            </div>
            <div className="form-group">
              <label>Project Key</label>
              <input
                type="text"
                value={jiraConfig.projectKey}
                onChange={(e) => setJiraConfig({ ...jiraConfig, projectKey: e.target.value })}
                placeholder="PROJ"
              />
            </div>
            <button onClick={handleJiraSave} className="btn-primary">
              Save Configuration
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Google Calendar Integration</h2>
          <div className="integration-card">
            <p>Connect your Google Calendar to track availability</p>
            <button onClick={handleCalendarConnect} className="btn-primary">
              Connect Calendar
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>AI Settings</h2>
          <div className="integration-card">
            <p>AI features are enabled and configured on the server</p>
            <div className="info-item">
              <strong>Priority Scoring:</strong> Enabled
            </div>
            <div className="info-item">
              <strong>Task Assignment:</strong> Enabled
            </div>
            <div className="info-item">
              <strong>Requirement Extraction:</strong> Enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;




