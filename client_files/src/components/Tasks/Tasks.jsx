import React from 'react';
import { createJiraFromTask } from '../../api/jira'; // <-- added import

// inside task item / list rendering - small snippet to add a button (place where task object is available)
async function handleCreateJira(task) {
  try {
    const projectKey = window.prompt('Jira project key (e.g. PROJ):');
    if (!projectKey) return;
    const json = await createJiraFromTask(task._id, projectKey);
    // json.jira contains issue data, json.task contains updated task
    alert(`Created Jira issue ${json.jira.key}`);
    // optionally refresh task list / state here
  } catch (err) {
    console.error(err);
    alert('Failed to create Jira issue: ' + (err.message || 'unknown'));
  }
}

// ...inside JSX where each task is rendered...
// <button onClick={() => handleCreateJira(task)} className="btn-outline">Create in Jira</button>
// ...existing code...