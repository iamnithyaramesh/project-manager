const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const { auth } = require('../middleware/auth');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// Extract requirements from text
router.post('/extract-requirements', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const prompt = `Extract actionable requirements from the following text. Return only a JSON array of requirements, each with:
- title: Short title for the requirement
- description: Detailed description
- category: Type of requirement (feature, bug, improvement, etc.)
- estimatedHours: Estimated hours to complete

Text:
${text}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const content = response.data.choices[0].message.content;
    const requirements = JSON.parse(content);

    res.json({ requirements });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Failed to extract requirements: ' + error.message });
  }
});

// Prioritize tasks using AI
router.post('/prioritize-tasks', auth, async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Tasks array is required' });
    }

    const tasksText = tasks.map((t, i) => 
      `${i + 1}. ${t.title} - ${t.description}`
    ).join('\n');

    const prompt = `Prioritize the following tasks based on business value, urgency, dependencies, and impact. Return a JSON array with the same order but add a "priorityScore" (0-100) and "reason" for each task.

Tasks:
${tasksText}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const content = response.data.choices[0].message.content;
    const prioritizedTasks = JSON.parse(content);

    res.json({ tasks: prioritizedTasks });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Failed to prioritize tasks: ' + error.message });
  }
});

// Suggest employee assignment
router.post('/suggest-assignment', auth, async (req, res) => {
  try {
    const { taskDescription, skillsRequired, availableEmployees } = req.body;

    if (!taskDescription || !availableEmployees) {
      return res.status(400).json({ message: 'Task description and employees are required' });
    }

    const employeesText = availableEmployees.map((e, i) => 
      `${i + 1}. ${e.name} - Skills: ${e.skills.join(', ')} - Role: ${e.role}`
    ).join('\n');

    const prompt = `Based on the task description and available employees, suggest the best employee assignment. Return a JSON object with "employeeIndex" (0-based) and "reason".

Task: ${taskDescription}
Required Skills: ${skillsRequired.join(', ')}
Available Employees:
${employeesText}`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const content = response.data.choices[0].message.content;
    const suggestion = JSON.parse(content);

    res.json({ suggestion });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Failed to suggest assignment: ' + error.message });
  }
});

module.exports = router;




