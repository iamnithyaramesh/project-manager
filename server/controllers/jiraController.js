const { createIssue, getIssue } = require('../services/jiraService');
const Task = require('../models/Task');

exports.createIssueFromTask = async (req, res) => {
  try {
    const { taskId, projectKey } = req.body;
    if (!taskId || !projectKey) return res.status(400).json({ error: 'taskId and projectKey required' });

    const task = await Task.findById(taskId).populate('project', 'title');
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const summary = `${task.title}`;
    const description = task.description || '';

    const jiraIssue = await createIssue({ projectKey, summary, description, issueType: 'Task' });

    task.jiraIssueKey = jiraIssue.key;
    task.jiraUrl = jiraIssue.self || `${process.env.JIRA_BASE_URL}/browse/${jiraIssue.key}`;
    task.jiraSyncedAt = new Date();
    await task.save();

    res.json({ jira: jiraIssue, task });
  } catch (err) {
    console.error('Jira create error', err);
    res.status(500).json({ error: err.message || 'Jira error' });
  }
};

exports.fetchIssue = async (req, res) => {
  try {
    const { key } = req.params;
    if (!key) return res.status(400).json({ error: 'issue key required' });
    const issue = await getIssue(key);
    res.json(issue);
  } catch (err) {
    console.error('Jira fetch error', err);
    res.status(500).json({ error: err.message || 'Jira fetch error' });
  }
};