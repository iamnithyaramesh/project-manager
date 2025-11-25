const express = require('express');
const router = express.Router();
const { prioritizeTasks } = require('../services/aiService');
const Task = require('../models/Task');

// POST /api/tasks/ai/prioritize
// body: { tasks: [ ...optional tasks objects... ] }
// If body.tasks absent, it will load recent tasks from DB
router.post('/ai/prioritize', async (req, res) => {
  try {
    let tasks = req.body?.tasks;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      // load tasks from DB
      tasks = await Task.find().limit(100).lean();
    }
    const results = await prioritizeTasks(tasks);

    // optionally persist score + reason back to tasks in DB
    if (req.body?.persist === true) {
      const ops = results.map(r => ({
        updateOne: {
          filter: { _id: r.id },
          update: { $set: { aiPriorityScore: r.score, aiPriorityReason: r.reason, aiPriorityAt: new Date() } }
        }
      }));
      if (ops.length) await Task.bulkWrite(ops);
      // reload updated tasks to return
      const updated = await Task.find({ _id: { $in: results.map(r => r.id) } }).lean();
      // merge ai fields into returned list, sorted
      const merged = results.map(r => {
        const t = updated.find(u => String(u._id) === String(r.id)) || tasks.find(u => String(u._id) === String(r.id));
        return { ...t, aiPriorityScore: r.score, aiPriorityReason: r.reason };
      });
      return res.json({ prioritized: merged });
    }

    // return scores only + original tasks map
    const map = {};
    tasks.forEach(t => { map[t._id || t.id] = t; });
    const prioritized = results.map(r => ({ ...map[r.id], aiPriorityScore: r.score, aiPriorityReason: r.reason }));
    res.json({ prioritized });
  } catch (err) {
    console.error('AI prioritize error', err);
    res.status(500).json({ error: 'AI prioritization failed', details: err.message });
  }
});

module.exports = router;