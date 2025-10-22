# Project Manager - Complete System Overview

## 📖 Project Description

A comprehensive AI-powered project management system that:
- Extracts requirements from documents and emails
- Uses AI to prioritize tasks
- Maps employees to tasks based on skills and availability
- Integrates with Google Calendar and Jira
- Tracks employee performance for appraisals

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT tokens
- **File Processing:** PDF, Word, Text parsing
- **AI Integration:** OpenAI GPT for task prioritization
- **External APIs:** Google Calendar, Jira REST API

### Frontend (React)
- **Framework:** React 18
- **Routing:** React Router
- **State Management:** Context API
- **UI/UX:** Modern gradient design, responsive layout
- **Charts:** Recharts for data visualization

## 📁 Project Structure

```
project-manager/
├── server/                          # Backend API
│   ├── models/                     # Database models
│   │   ├── User.js                # User/Employee model
│   │   ├── Project.js             # Project model
│   │   ├── Task.js                # Task model
│   │   └── EmployeePerformance.js # Performance tracking
│   ├── routes/                     # API endpoints
│   │   ├── auth.js               # Authentication
│   │   ├── projects.js           # Project management
│   │   ├── tasks.js              # Task management
│   │   ├── employees.js          # Employee management
│   │   ├── document.js           # Document parsing
│   │   ├── ai.js                 # AI features
│   │   ├── calendar.js           # Google Calendar
│   │   └── jira.js               # Jira integration
│   ├── middleware/                # Auth middleware
│   └── index.js                   # Server entry
├── client/                         # Frontend React app
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── Auth/            # Login/Register
│   │   │   ├── Dashboard/       # Dashboard
│   │   │   ├── Projects/        # Project management
│   │   │   ├── Tasks/           # Task management
│   │   │   ├── Employees/       # Employee directory
│   │   │   ├── Documents/      # Document upload
│   │   │   ├── Settings/       # App settings
│   │   │   └── Layout/         # Navbar
│   │   ├── context/             # Context providers
│   │   │   └── AuthContext.js  # Auth state
│   │   ├── App.js               # App component
│   │   └── index.js            # Entry point
│   └── public/                   # Static files
├── package.json                  # Root config
├── README.md                     # Main documentation
├── SETUP.md                      # Setup instructions
├── QUICKSTART.md                 # Quick start guide
└── .gitignore                    # Git ignore rules
```

## 🎯 Core Features

### 1. Document & Email Parsing
**Implementation:**
- Supports PDF, Word (.docx), and Text files
- Extracts text using pdf-parse and mammoth libraries
- Parses email content (subject, body, from)
- API: `/api/document/upload` and `/api/document/parse-email`

**Use Case:**
Client sends requirements via email or PDF → System extracts actionable requirements

### 2. AI-Based Task Prioritization
**Implementation:**
- Uses OpenAI GPT-3.5-turbo
- Calculates priority scores (0-100)
- Provides reasoning for prioritization
- API: `/api/ai/prioritize-tasks`

**Use Case:**
Tasks automatically ranked by AI → Users can adjust → Better resource allocation

### 3. Employee Mapping
**Implementation:**
- Filters employees by skills
- Checks availability via Google Calendar
- AI suggests best assignments
- Manual override for team leads
- API: `/api/employees/available/list` and `/api/ai/suggest-assignment`

**Use Case:**
New task requires React skills → System finds available React developers → Team lead assigns

### 4. Google Calendar Integration
**Implementation:**
- OAuth 2.0 authentication
- Check employee availability
- Create task events
- API: `/api/calendar/*`

**Use Case:**
Assign task → Check if employee has free time → Schedule task → Sync to calendar

### 5. Jira Integration
**Implementation:**
- REST API integration
- Sync tasks to Jira issues
- Two-way status updates
- API: `/api/jira/*`

**Use Case:**
Create task in app → Sync to Jira → Team uses Jira → Updates sync back

### 6. Performance Tracking
**Implementation:**
- Automatic tracking on task completion
- Records hours worked
- Quality ratings
- Performance history
- API: Employee performance endpoints

**Use Case:**
Employee completes task → System records performance → Available for appraisals

## 🔐 Authentication & Authorization

### JWT-Based Auth
- Secure token-based authentication
- 7-day token expiration
- Protected routes with middleware

### Role-Based Access Control
- **Admin:** Full access
- **Team Lead:** Manage team, assign tasks
- **Employee:** View assigned tasks, update status
- **Client:** View projects, submit requirements

## 🗄️ Database Schema

### User Model
```javascript
{
  email, password, name, role,
  skills, department, phone,
  googleCalendarId, jiraAccountId,
  availability
}
```

### Project Model
```javascript
{
  name, description, clientId,
  status, priority, aiPriorityScore,
  teamMembers, startDate, endDate,
  budget, documents, jiraProjectKey
}
```

### Task Model
```javascript
{
  title, description, projectId,
  assignedTo, assignedBy, status,
  priority, aiPriorityScore,
  estimatedHours, actualHours,
  startDate, dueDate, completedAt,
  skillsRequired, jiraIssueKey, tags
}
```

### EmployeePerformance Model
```javascript
{
  employeeId, taskId, projectId,
  hoursWorked, quality, completedOnTime,
  review, rating, completedAt
}
```

## 🎨 UI/UX Features

### Design Highlights
- Modern gradient color scheme (purple/blue)
- Responsive grid layouts
- Smooth animations and transitions
- Intuitive navigation
- Real-time updates

### Components
- **Dashboard:** Statistics, recent tasks
- **Projects:** Card-based project view
- **Tasks:** List view with status badges
- **Employees:** Two-column layout (list + details)
- **Documents:** Upload and parsing interface
- **Settings:** Integration configuration

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
1. Build frontend: `cd client && npm run build`
2. Start backend: `cd server && npm start`
3. Configure environment variables
4. Set up MongoDB production instance
5. Enable HTTPS for secure API

## 📊 Metrics & Analytics

### Tracked Metrics
- Total projects
- Total tasks
- Completed tasks
- Employee count
- Hours worked
- Performance ratings

### Performance Data
- Task completion rates
- Average ratings
- Skills development
- Project participation

## 🔗 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require JWT token in headers:
```
Authorization: Bearer <token>
```

### Response Format
```json
{
  "data": {...},
  "message": "Success"
}
```

### Error Format
```json
{
  "message": "Error description"
}
```

## 🛠️ Technology Stack

### Backend
- Node.js 14+
- Express.js 4.18
- MongoDB 8.0
- Mongoose ODM
- JWT authentication
- OpenAI API
- Google APIs
- Jira REST API

### Frontend
- React 18
- React Router 6
- Axios
- Context API
- React Icons
- Custom CSS

### Development Tools
- Nodemon (dev server)
- Concurrently (run both servers)
- Git (version control)

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack development
- RESTful API design
- Database modeling
- Authentication & authorization
- Third-party API integration
- AI/ML integration
- Modern React patterns
- Responsive UI design
- File processing
- Real-time updates

## 🔮 Future Enhancements

Potential additions:
- Real-time notifications
- Team chat functionality
- Advanced analytics dashboard
- Mobile app (React Native)
- Automated testing
- CI/CD pipeline
- Docker containerization
- More AI features
- Advanced reporting
- Kanban board view

## 📝 Notes

- MongoDB must be running for the app to work
- OpenAI API key required for AI features
- Jira and Calendar integrations are optional
- File uploads are temporary (deleted after processing)
- JWT tokens expire after 7 days
- Performance tracking is automatic

---

**Built with ❤️ using modern web technologies**




