# Project Manager - AI-Powered Task Management System

A comprehensive project management application with AI-based task prioritization, employee mapping, and integrations with Google Calendar and Jira.

## Features

### Core Functionality
- **Document & Email Parsing**: Extract requirements from PDFs, Word documents, and emails
- **AI-Based Task Prioritization**: Leverage OpenAI to automatically prioritize tasks
- **Employee Mapping**: Match employees to tasks based on skills, role, and availability
- **Google Calendar Integration**: Sync with Google Calendar for availability tracking
- **Jira Integration**: Two-way sync with Jira for project management
- **Performance Tracking**: Automatically track employee performance and appraisals
- **Role-Based Access**: Support for admin, team lead, employee, and client roles

### User Interface
- Modern, responsive React UI
- Drag-and-drop task management
- Real-time updates
- Performance dashboards
- Calendar view
- Team collaboration tools

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- OpenAI API integration
- Google Calendar API
- Jira REST API

### Frontend
- React 18
- React Router
- Axios for API calls
- Beautiful DnD for drag-and-drop
- Recharts for data visualization
- React Icons

## Installation

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   - MongoDB connection string
   - JWT secret
   - OpenAI API key
   - Google OAuth credentials
   - Jira credentials (optional)

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend client on http://localhost:3000

## Usage

### 1. User Registration/Login
- Register as admin, team lead, employee, or client
- Login to access the dashboard

### 2. Upload Documents
- Go to "Documents" section
- Upload PDF/Word/Text files
- System extracts requirements using AI

### 3. Create Projects
- Create a new project
- Add team members
- Set priority and dates

### 4. Task Management
- Create tasks from extracted requirements
- Use AI to prioritize tasks
- Assign tasks to employees based on:
  - Required skills
  - Employee availability (Google Calendar)
  - Current workload

### 5. Employee Mapping
- View available employees
- Filter by skills and availability
- AI suggests best assignments
- Manual override by team leads

### 6. Sync with Jira
- Connect Jira account
- Sync tasks to Jira issues
- Two-way updates

### 7. Performance Tracking
- Tasks automatically update employee profiles
- Track completed tasks, hours worked
- Performance ratings and reviews
- Easy appraisal preparation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/complete` - Complete task
- `DELETE /api/tasks/:id` - Delete task

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee details
- `GET /api/employees/:id/performance` - Get performance data
- `GET /api/employees/available/list` - Get available employees

### AI
- `POST /api/ai/extract-requirements` - Extract requirements from text
- `POST /api/ai/prioritize-tasks` - Prioritize tasks
- `POST /api/ai/suggest-assignment` - Suggest employee assignment

### Calendar
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/check-availability` - Check availability
- `POST /api/calendar/create-event` - Create calendar event

### Jira
- `POST /api/jira/sync-task` - Sync task to Jira
- `PUT /api/jira/update-issue/:issueKey` - Update Jira issue
- `GET /api/jira/issues` - Get Jira issues

### Documents
- `POST /api/document/upload` - Upload and parse document
- `POST /api/document/parse-email` - Parse email content

## Database Schema

### User
- Authentication and profile information
- Role, skills, department
- Calendar and Jira integration IDs

### Project
- Project details and status
- Team members
- Priority and AI score
- Integration with Jira

### Task
- Task details and assignment
- Status and priority
- AI priority score
- Skills required
- Jira issue key

### EmployeePerformance
- Task completion tracking
- Hours worked
- Quality ratings
- Performance history

## Development

### Adding New Features
1. Create models in `server/models/`
2. Add routes in `server/routes/`
3. Update frontend components in `client/src/`
4. Test API endpoints

### Environment Variables
All sensitive configuration should be in `.env` file in the server directory.

## Contributing
This is a comprehensive project management system. Feel free to extend and customize based on your needs.

## License
MIT




