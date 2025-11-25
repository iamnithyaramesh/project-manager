const axios = require('axios');

const PROVIDER = (process.env.GEMINI_PROVIDER || 'google').toLowerCase();
const API_KEY = process.env.GEMINI_KEY;
const MODEL = process.env.GEMINI_MODEL || (PROVIDER === 'google' ? 'text-bison-001' : 'gpt-4o-mini');

if (!API_KEY) console.warn('GEMINI_KEY not set. AI prioritization will fail without a key.');

async function callModel(prompt) {
  if (PROVIDER === 'google') {
    // Google Generative Language API (Generative Language / Gemini)
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/${MODEL}:generateText?key=${API_KEY}`;
    const body = { prompt: { text: prompt }, maxOutputTokens: 1024 };
    const res = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
    // flexible extraction
    return (res.data?.candidates && res.data.candidates[0]?.output) ||
           (res.data?.candidates && res.data.candidates[0]?.content) ||
           JSON.stringify(res.data);
  } else {
    // OpenAI-compatible path (chat completions)
    const url = 'https://api.openai.com/v1/chat/completions';
    const body = {
      model: MODEL,
      messages: [{ role: 'system', content: 'You are an assistant that ranks tasks by priority.' },
                 { role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.0
    };
    const res = await axios.post(url, body, { headers: { Authorization: `Bearer ${API_KEY}` } });
    return res.data?.choices?.[0]?.message?.content || res.data?.choices?.[0]?.text || JSON.stringify(res.data);
  }
}

// Prompt builder: instruct model to output strict JSON
function buildPriorityPrompt(tasks) {
  const tasksText = tasks.map(t => {
    const d = t.dueDate ? ` due:${t.dueDate}` : '';
    const effort = t.effortEstimate ? ` effort:${t.effortEstimate}` : '';
    const impact = t.impact ? ` impact:${t.impact}` : '';
    return `- id:${t._id || t.id} title:"${t.title.replace(/"/g, '\\"')}"${d}${effort}${impact} description:"${(t.description||'').replace(/"/g,'\\"')}"`;
  }).join('\n');

  return `
You are given a list of tasks. Score each task from 0 (lowest priority) to 100 (highest priority) based on urgency, impact, due date proximity, and effort tradeoffs.
Return a JSON array only, where each element is:
{ "id": "<task id>", "score": <0-100 numeric>, "reason": "<brief explanation - 1-2 sentences>" }

Tasks:
${tasksText}

Rules:
- Use numeric score between 0 and 100.
- Sort not required in the response, server will sort.
- Output only valid JSON (no commentary).
`;
}

async function prioritizeTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];
  const prompt = buildPriorityPrompt(tasks);
  const raw = await callModel(prompt);

  // try parse JSON from model output
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    // attempt to extract the first JSON block
    const jsonMatch = raw.match(/(\[.*\])/s);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[1]); } catch (e) { parsed = null; }
    }
  }
  if (!Array.isArray(parsed)) {
    // fallback: simple heuristic scoring based on dueDate proximity and a basic parse
    const fallback = tasks.map(t => {
      const daysUntil = t.dueDate ? Math.max(0, Math.round((new Date(t.dueDate) - Date.now()) / (1000*60*60*24))) : 9999;
      const effort = Number(t.effortEstimate || 5);
      const impact = Number(t.impact || 3);
      // score heuristic: higher impact and closer due dates increase score; lower effort increases score
      const score = Math.max(0, Math.min(100, Math.round((impact * 10) + Math.max(0, 30 - daysUntil) + (10 / Math.max(1, effort)) * 5)));
      return { id: t._id || t.id, score, reason: 'Fallback heuristic: impact/due/effort.' };
    });
    return fallback.sort((a,b) => b.score - a.score);
  }

  // normalize results: ensure numeric scores and ids present
  const normalized = parsed.map(p => ({
    id: p.id,
    score: Number(p.score || 0),
    reason: String(p.reason || '')
  })).sort((a,b) => b.score - a.score);

  return normalized;
}

module.exports = { prioritizeTasks };