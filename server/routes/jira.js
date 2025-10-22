const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');

// Create Jira client
const createJiraClient = (email, apiToken, baseUrl) => {
  const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
};

// Sync task to Jira
router.post('/sync-task', auth, async (req, res) => {
  try {
    const { task, jiraConfig } = req.body;

    if (!jiraConfig || !jiraConfig.email || !jiraConfig.apiToken || !jiraConfig.baseUrl) {
      return res.status(400).json({ message: 'Jira configuration required' });
    }

    const jira = createJiraClient(jiraConfig.email, jiraConfig.apiToken, jiraConfig.baseUrl);

    const issue = {
      fields: {
        project: { key: jiraConfig.projectKey },
        summary: task.title,
        description: task.description,
        issuetype: { name: 'Task' },
        priority: { name: task.priority || 'Medium' }
      }
    };

    const response = await jira.post('/rest/api/3/issue', issue);

    res.json({ issueKey: response.data.key, issueId: response.data.id });
  } catch (error) {
    console.error('Jira Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to sync to Jira' });
  }
});

// Update Jira issue
router.put('/update-issue/:issueKey', auth, async (req, res) => {
  try {
    const { issueKey } = req.params;
    const { status, jiraConfig } = req.body;

    if (!jiraConfig) {
      return res.status(400).json({ message: 'Jira configuration required' });
    }

    const jira = createJiraClient(jiraConfig.email, jiraConfig.apiToken, jiraConfig.baseUrl);

    const update = {
      fields: {
        status: { name: status }
      }
    };

    await jira.put(`/rest/api/3/issue/${issueKey}`, update);

    res.json({ message: 'Issue updated' });
  } catch (error) {
    console.error('Jira Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to update Jira issue' });
  }
});

// Get Jira issues
router.get('/issues', auth, async (req, res) => {
  try {
    const { jiraConfig, projectKey } = req.query;

    if (!jiraConfig) {
      return res.status(400).json({ message: 'Jira configuration required' });
    }

    const config = JSON.parse(jiraConfig);
    const jira = createJiraClient(config.email, config.apiToken, config.baseUrl);

    const response = await jira.get(`/rest/api/3/search`, {
      params: {
        jql: `project = ${projectKey}`
      }
    });

    res.json({ issues: response.data.issues });
  } catch (error) {
    console.error('Jira Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch Jira issues' });
  }
});

module.exports = router;




