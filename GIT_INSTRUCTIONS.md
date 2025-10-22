# Upload Project to Git

## Quick Steps to Upload to GitHub

### 1. Initialize Git Repository
```bash
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Make Initial Commit
```bash
git commit -m "Initial commit: AI-powered project management system"
```

### 4. Create GitHub Repository
- Go to https://github.com
- Click "New Repository"
- Name it: `project-manager` (or any name you prefer)
- **Don't** initialize with README (you already have one)
- Click "Create repository"

### 5. Connect to GitHub and Push
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/project-manager.git
git branch -M main
git push -u origin main
```

## Alternative: If GitHub Repo Already Exists

If you already created the repository on GitHub with a README:

```bash
git remote add origin https://github.com/YOUR_USERNAME/project-manager.git
git branch -M main
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Check What Will Be Uploaded

Before pushing, you can check what files will be uploaded:

```bash
git status
```

## Important Files Already Excluded

The `.gitignore` file will prevent these from being uploaded:
- `node_modules/` - Dependencies (too large)
- `.env` - Environment variables (sensitive data)
- `build/` - Build files
- `uploads/` - Uploaded files

## Troubleshooting

### If You Get Authentication Error
```bash
# Use Personal Access Token instead of password
# Generate one at: https://github.com/settings/tokens
```

### If You Want to Update Later
```bash
git add .
git commit -m "Your commit message"
git push
```

## Clean Up (Optional)

After pushing, you can verify what's on GitHub:
```bash
git remote -v  # Check connected remotes
git log --oneline  # Check commit history
```




