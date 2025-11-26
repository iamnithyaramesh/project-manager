# Project Manager

A full-stack web application for managing projects, tasks, and team members. Built with React (frontend) and Node.js/Express (backend) with MongoDB database.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Validation Rules](#validation-rules)
- [Usage Guide](#usage-guide)

---

##  Features

### Core Features
- **Authentication & Authorization**
  - User registration and login with JWT tokens
  - Role-based access control (admin, team_lead, employee, client)
  - Secure password hashing with bcrypt

- **Project Management**
  - Create, read, update, delete projects
  - Assign team members to projects
  - Track project status (planning, active, on_hold, completed, cancelled)
  - Set project priorities and budgets
  - Manage project documents

- **Task Management**
  - Create tasks and link to projects
  - Assign tasks to team members
  - Kanban board view (To Do → In Progress → Completed)
  - Drag & drop task status updates
  - Priority levels (low, medium, high, critical)
  - Track estimated and actual hours
  - Task completion tracking

- **Employee Management**
  - Manage team members
  - Assign skills and departments
  - View employee performance metrics
  - Filter available employees by skills

- **Dashboard**
  - Real-time statistics (projects, tasks, employees)
  - Recent projects display
  - Recent tasks feed
  - Task completion rate
  - Quick action buttons

- **Document Management**
  - Upload documents (PDF, DOCX, text)
  - Extract text from documents
  - Link documents to projects and tasks
  - Track document metadata

---

##  Tech Stack

### Frontend
- **React** - UI framework
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Icons** - Icon library
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Document Mapper)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing
- **Multer** - File uploads
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX text extraction

---

##  Project Structure

```
project-manager/
├── client/                          # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/               # Login & Register
│   │   │   ├── Dashboard/          # Dashboard view
│   │   │   ├── Projects/           # Projects management
│   │   │   ├── Tasks/              # Kanban board
│   │   │   ├── Employees/          # Team management
│   │   │   ├── Documents/          # Document management
│   │   │   ├── Settings/           # User settings
│   │   │   └── Layout/             # Navigation
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state management
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/                          # Node.js backend
│   ├── controllers/
│   │   ├── documentsController.js
│   │   ├── googleController.js
│   │   └── jiraController.js
│   ├── middleware/
│   │   └── auth.js                 # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── TaskFixed.js
│   │   └── Document.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── employees.js
│   │   ├── documents.js
│   │   ├── jira.js
│   │   ├── google.js
│   │   ├── ai.js
│   │   └── tasksAi.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── googleService.js
│   │   └── jiraService.js
│   ├── db.js                       # MongoDB connection
│   ├── index.js                    # Main server file
│   ├── .env                        # Environment variables
│   └── package.json
│
├── data/
│   └── dummy.json                  # Sample data
│
├── uploads/                         # Uploaded files storage
└── README.md
```

---

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Clone Repository
```bash
git clone https://github.com/iamnithyaramesh/project-manager.git
cd project-manager
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

### Step 3: Install Client Dependencies
```bash
cd ../client
npm install
```

---

##  Configuration

### Backend Configuration (server/.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/project-manager
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-manager

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# Optional: External Services (not yet implemented)
GOOGLE_API_KEY=your-google-key
JIRA_API_TOKEN=your-jira-token
OPENAI_API_KEY=your-openai-key
```

### Frontend Configuration (client/src/context/AuthContext.js)
- API base URL: `http://localhost:5000` (hardcoded, can be moved to .env)
- Token stored in localStorage under `token` key

---

##  Running the Application

### Start Backend
```bash
cd server
npm start
```
Server will run on `http://localhost:5000`

### Start Frontend
```bash
cd client
npm start
```
Frontend will run on `http://localhost:3000`

### Database Setup
```bash
# MongoDB local setup
mongod

# Or use MongoDB Atlas cloud database
# Update MONGODB_URI in server/.env
```

---

##  API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects (user's) |
| GET | `/api/projects/:id` | Get single project |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/team-members` | Add team member |
| DELETE | `/api/projects/:id/team-members/:memberId` | Remove team member |
| GET | `/api/projects/stats/overview` | Project statistics |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (user's) |
| GET | `/api/tasks/project/:projectId` | Get tasks by project |
| GET | `/api/tasks/employee/:employeeId` | Get tasks by employee |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/complete` | Mark task as complete |
| POST | `/api/tasks/:id/complete-and-delete` | Complete and delete task |
| GET | `/api/tasks/completed` | Get completed tasks |
| DELETE | `/api/tasks/completed/cleanup` | Delete all completed tasks |
| GET | `/api/tasks/stats` | Task statistics |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| POST | `/api/employees` | Create new employee |
| GET | `/api/employees/:id` | Get employee details |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/employees/:id/performance` | Employee performance metrics |
| GET | `/api/employees/available/list` | Get available employees |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents` | Upload document |
| GET | `/api/documents` | Get all documents |

---

##  Database Models

### User Model
```javascript
{
  email: String (unique, required, lowercase),
  password: String (required, hashed),
  name: String (required),
  role: String (admin, team_lead, employee, client),
  skills: [String],
  department: String,
  phone: String,
  availability: Boolean (default: true),
  isActive: Boolean (default: true),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  hireDate: Date,
  createdAt: Date
}
```

### Project Model
```javascript
{
  name: String (required),
  description: String,
  status: String (planning, active, on_hold, completed, cancelled),
  priority: String (low, medium, high, critical),
  budget: Number,
  startDate: Date,
  endDate: Date,
  clientId: ObjectId (ref: User),
  createdBy: ObjectId (ref: User, required),
  teamMembers: [{
    userId: ObjectId (ref: User),
    role: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String,
  projectId: ObjectId (ref: Project),
  assignedTo: ObjectId (ref: User),
  assignedBy: ObjectId (ref: User),
  status: String (todo, in_progress, review, completed, blocked),
  priority: String (low, medium, high, critical),
  estimatedHours: Number,
  actualHours: Number,
  startDate: Date,
  dueDate: Date,
  completedAt: Date,
  skillsRequired: [String],
  tags: [String],
  notes: [{
    text: String,
    addedBy: ObjectId (ref: User),
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Document Model
```javascript
{
  filename: String (required),
  size: Number,
  contentType: String,
  text: String (extracted text),
  project: ObjectId (ref: Project),
  uploadedBy: ObjectId (ref: User),
  createdAt: Date
}
```

---

##  Validation Rules

### User/Login Validations
-  Email uniqueness
-  Email required
-  Password required (min 8 chars recommended)
-  Password hashing with bcrypt (10 rounds)
-  Role enum validation
-  Generic error messages (no user enumeration)

### Project Validations
-  Name required
-  Status enum validation
-  Priority enum validation
-  CreatedBy required
-  Date range validation (startDate <= endDate) - recommended
-  Budget > 0 validation - recommended

### Task Validations
-  Title required
-  Status enum validation
-  Priority enum validation
-  Date range validation - recommended
-  Hours validation (estimatedHours > 0) - recommended

### Document Validations
-  Filename required
-  File size limit - recommended
-  MIME type whitelist - recommended

---

##  Usage Guide

### 1. Register & Login
1. Navigate to `/` or `/login`
2. Click "Sign Up" to register new account
3. Fill form: name, email, password, role
4. Login with credentials
5. JWT token stored in localStorage

### 2. Create a Project
1. Go to **Projects** page
2. Click **Add Manually** or **Upload SRS Document**
3. Fill project details: name, description, priority, status
4. Click **Create**

### 3. Create a Task
1. Go to **Tasks** page (Kanban board)
2. Click **Add Task**
3. Fill task details:
   - Title (required)
   - Description
   - Project (required) - select from dropdown
   - Assign to (optional) - select employee
   - Priority
   - Estimated hours
4. Click **Create Task**

### 4. Manage Tasks
- **Drag & Drop**: Drag task card between columns to change status
- **Edit**: Click edit icon on task card
- **Delete**: Click delete icon
- **Complete**: Click "Complete & Delete" button
- **Filter**: Use project dropdown to filter by project

### 5. Assign Team Members to Project
1. Create project
2. Go to project details
3. Click **Add Team Member**
4. Select employee and assign role

### 6. View Dashboard
- See statistics: projects, tasks, employees, completion rate
- View recent projects and tasks
- Quick access buttons to manage items

---

##  Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)
- Protected routes with auth middleware
- CORS enabled for cross-origin requests
- Error handling without information leakage

---

##  Known Issues & Future Improvements

### Not Yet Implemented
-  Google Calendar integration
-  Jira integration
-  AI-powered task prioritization
-  Real-time notifications
-  File upload size limits
-  MIME type validation
-  Email notifications
-  Two-factor authentication

### Recommended Enhancements
- Add date range validation (startDate <= endDate)
- Add password strength requirements
- Add rate limiting on login attempts
- Add file virus scanning
- Add email verification
- Add activity logging
- Add export to PDF/Excel
- Add task templates
- Add recurring tasks
- Add time tracking

---

##  License

This project is open source and available under the MIT License.

---

## 👨 Author

**Nithyasri Ramesh**
- GitHub: [@iamnithyaramesh](https://github.com/iamnithyaramesh)
- Repository: [project-manager](https://github.com/iamnithyaramesh/project-manager)


