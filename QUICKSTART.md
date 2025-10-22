# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Configure Environment
Create `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-manager
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-openai-key
```

**Note:** MongoDB and OpenAI API key are required for basic functionality.

### Step 3: Start MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo mongod
```

Or use MongoDB Atlas (cloud) and update MONGODB_URI.

### Step 4: Run the App
```bash
npm run dev
```

### Step 5: Access
- Open http://localhost:3000
- Register an account
- Start managing projects!

## 🎯 Key Features

### 1. Document Parsing
- Upload PDF/Word files
- Extract requirements automatically using AI
- Parse email content

### 2. AI Task Prioritization
- Automatic priority scoring
- Smart task recommendations
- Manual override available

### 3. Employee Management
- View team members
- Filter by skills
- Check availability
- AI-suggested assignments

### 4. Google Calendar Integration
- Connect personal calendars
- Check availability
- Create task events

### 5. Jira Sync
- Configure Jira credentials
- Sync tasks to Jira issues
- Two-way updates

### 6. Performance Tracking
- Automatic tracking on task completion
- Hours worked tracking
- Performance ratings
- Easy appraisal reports

## 👥 User Roles

### Admin
- Full system access
- Manage all projects and employees
- System configuration

### Team Lead
- Manage team members
- Assign tasks
- Review performance
- Create projects

### Employee
- View assigned tasks
- Update task status
- Complete tasks
- View own performance

### Client
- View projects
- Submit requirements
- Track progress

## 📋 Workflow Example

1. **Client submits requirements** via email or document
2. **System extracts** requirements using AI
3. **Requirements become tasks** in a project
4. **AI prioritizes** tasks based on importance
5. **Team Lead assigns** tasks to employees
6. **Employees complete** tasks
7. **Performance tracked** automatically
8. **Sync with Jira** for project management

## 🔧 Customization

### Add Skills
Edit employee profile in Employees section to add skills.

### Configure Integrations
Go to Settings to add:
- Jira credentials
- Google Calendar OAuth
- OpenAI API key

### Adjust Priorities
Tasks can be manually re-prioritized at any time.

## 📱 Mobile Responsive

The UI is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🆘 Need Help?

See SETUP.md for detailed instructions.




