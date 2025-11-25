const axios = require('axios');

const baseUrl = (process.env.JIRA_BASE_URL || '').replace(/\/$/, '');
const username = process.env.JIRA_USERNAME || '';
const apiToken = process.env.JIRA_API_TOKEN || '';

function authHeader() {
  if (!username || !apiToken) return null;
  return `Basic ${Buffer.from(`${username}:${apiToken}`).toString('base64')}`;
}

const jira = axios.create({
  baseURL: baseUrl ? `${baseUrl}/rest/api/3` : undefined,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// inject auth header if available
jira.interceptors.request.use(cfg => {
  const h = authHeader();
  if (h) cfg.headers['Authorization'] = h;
  return cfg;
});

async function createIssue({ projectKey, summary, description, issueType = 'Task', fields = {} }) {
  if (!baseUrl) throw new Error('JIRA_BASE_URL not configured');
  const payload = {
    fields: {
      project: { key: projectKey },
      summary,
      description,
      issuetype: { name: issueType },
      ...fields
    }
  };
  const res = await jira.post('/issue', payload);
  return res.data;
}

async function getIssue(issueKey) {
  const res = await jira.get(`/issue/${issueKey}`);
  return res.data;
}

async function searchIssues(jql, maxResults = 50) {
  const res = await jira.post('/search', { jql, maxResults });
  return res.data;
}

async function addComment(issueKey, body) {
  const res = await jira.post(`/issue/${issueKey}/comment`, { body });
  return res.data;
}

async function transitionIssue(issueKey, transitionId) {
  const res = await jira.post(`/issue/${issueKey}/transitions`, { transition: { id: transitionId } });
  return res.data;
}

module.exports = { createIssue, getIssue, searchIssues, addComment, transitionIssue };