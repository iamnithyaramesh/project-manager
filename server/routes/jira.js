const express = require('express');
const router = express.Router();
const jiraController = require('../controllers/jiraController');

// POST /api/jira/create-from-task  { taskId, projectKey }
router.post('/create-from-task', jiraController.createIssueFromTask);

// GET /api/jira/issue/:key
router.get('/issue/:key', jiraController.getIssue);

module.exports = router;