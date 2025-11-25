export async function aiPrioritizeTasks({ tasks, persist = false } = {}) {
  const res = await fetch('/api/tasks/ai/prioritize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, persist })
  });
  if (!res.ok) throw new Error('AI prioritize request failed');
  return res.json();
}