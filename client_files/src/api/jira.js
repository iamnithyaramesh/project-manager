export async function createJiraFromTask(taskId, projectKey) {
  const res = await fetch('/api/jira/create-from-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, projectKey })
  });
  if (!res.ok) throw new Error('Failed creating Jira issue');
  return res.json();
}