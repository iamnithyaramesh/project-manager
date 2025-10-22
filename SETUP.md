# Setup Instructions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm run install-all
```

This will install dependencies for:
- Root directory
- Server (backend)
- Client (frontend)

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```bash
   mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and get connection string
3. Update MONGODB_URI in server/.env

### 3. Environment Configuration

Create `server/.env` file with the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-manager
JWT_SECRET=your-secret-key-here-change-this
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
```

#### Getting API Keys:

**OpenAI API Key:**
1. Visit https://platform.openai.com/
2. Sign up/Sign in
3. Go to API Keys section
4. Create a new API key

**Google OAuth Credentials (Optional):**
1. Visit https://console.cloud.google.com/
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add credentials to .env

### 4. Run the Application

Start both frontend and backend:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:3000

### 5. Access the Application

1. Open http://localhost:3000 in your browser
2. Register a new account (choose your role: admin, team_lead, employee, or client)
3. Start using the application!

## Features Overview

### Document Parsing
- Go to Documents section
- Upload PDF, Word, or Text files
- System extracts requirements automatically

### Email Parsing
- Go to Documents section
- Enter email details
- Extract requirements from email content

### AI Task Prioritization
- Tasks are automatically prioritized using AI
- AI Priority Score is calculated
- Users can adjust priority manually

### Employee Assignment
- View available employees
- Filter by skills and availability
- AI suggests best employee for task
- Manual assignment by team leads

### Google Calendar Integration
- Connect your Google Calendar
- Check employee availability
- Automatic schedule checking

### Jira Integration
- Configure Jira credentials in Settings
- Sync tasks to Jira issues
- Two-way updates between systems

### Performance Tracking
- Tasks automatically update employee profiles
- Track hours worked
- Performance ratings
- Easy appraisal preparation

## Project Structure

```
project-manager/
├── server/                 # Backend API
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── index.js           # Server entry point
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # Context providers
│   │   └── App.js        # App entry point
│   └── public/            # Static files
├── package.json           # Root package.json
└── README.md             # Project documentation
```

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

### Documents
- `POST /api/document/upload` - Upload and parse document
- `POST /api/document/parse-email` - Parse email content

### Calendar
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/check-availability` - Check availability
- `POST /api/calendar/create-event` - Create calendar event

### Jira
- `POST /api/jira/sync-task` - Sync task to Jira
- `PUT /api/jira/update-issue/:issueKey` - Update Jira issue
- `GET /api/jira/issues` - Get Jira issues

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### OpenAI API Error
- Verify OPENAI_API_KEY is correct
- Check your OpenAI account balance
- Ensure API key has proper permissions

### Port Already in Use
- Change PORT in server/.env
- Kill process using the port

### Frontend Build Errors
- Delete node_modules and reinstall
- Clear npm cache: `npm cache clean --force`
- Ensure Node.js version is compatible

## Development

### Backend Only
```bash
cd server
npm run dev
```

### Frontend Only
```bash
cd client
npm start
```

## Production Build

```bash
cd client
npm run build
```

The build folder will contain optimized production files.

## Additional Notes

- All file uploads are stored temporarily and deleted after processing
- JWT tokens expire after 7 days
- AI features require valid OpenAI API key
- Calendar and Jira integrations are optional
- Employee performance is tracked automatically on task completion

## Support

For issues or questions, refer to the main README.md file.




