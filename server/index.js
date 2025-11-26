require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connect } = require('./db');

const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const projectsRoutes = require('./routes/projects');
const employeesRoutes = require('./routes/employees');
const documentsRoutes = require('./routes/documents');
const documentRoutes = require('./routes/document');
const jiraRoutes = require('./routes/jira');
const tasksAiRoutes = require('./routes/tasksAi');

const app = express();
app.use(cors());
app.use(express.json());

// ensure upload temp dir exists
const uploadDir = path.join(process.cwd(), 'tmp', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
app.set('uploadDir', uploadDir);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/jira', jiraRoutes);
app.use('/api/tasks-ai', tasksAiRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

const PORT = process.env.PORT || 5000;
connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });