const axios = require('axios');
require('dotenv').config();

const PROVIDER = (process.env.GEMINI_PROVIDER || 'google').toLowerCase();
const API_KEY = process.env.GEMINI_KEY;
const MODEL = process.env.GEMINI_MODEL || (PROVIDER === 'google' ? 'text-bison-001' : 'gpt-4o-mini');

if (!API_KEY) console.warn('GEMINI_KEY not set; AI calls will fail.');

async function callModel(prompt) {
  if (PROVIDER === 'google') {
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/${MODEL}:generateText?key=${API_KEY}`;
    const body = { prompt: { text: prompt }, maxOutputTokens: 1024 };
    const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
    return res.data?.candidates?.[0]?.output || JSON.stringify(res.data);
  } else {
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = { model: MODEL, messages: [{ role: 'system', content: 'Rank tasks by priority; return JSON array.' }, { role: 'user', content: prompt }], max_tokens: 800, temperature: 0.0 };
    const res = await axios.post(url, body, { headers: { Authorization: `Bearer ${API_KEY}` } });
    return res.data?.choices?.[0]?.message?.content || JSON.stringify(res.data);
  }
}

function buildPrompt(tasks) {
  const tasksText = tasks.map(t => `- id:${t._id} title:"${(t.title||'').replace(/"/g,'\\"')}" due:${t.dueDate||''} priority:${t.priority||''} desc:"${(t.description||'').replace(/"/g,'\\"')}"`).join('\n');
  return `Score each task 0-100 and explain briefly. Output only JSON array like [{"id":"...","score":90,"reason":"..."}]\n\nTasks:\n${tasksText}`;
}

async function prioritizeTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];
  const prompt = buildPrompt(tasks);
  const raw = await callModel(prompt);

  try {
    return JSON.parse(raw);
  } catch (e) {
    const match = raw.match(/(\[.*\])/s);
    if (match) {
      try { return JSON.parse(match[1]); } catch (er) { /* fallthrough */ }
    }
    // fallback heuristic
    return tasks.map(t => ({ id: t._id, score: 50, reason: 'fallback score' }));
  }
}

module.exports = { prioritizeTasks };