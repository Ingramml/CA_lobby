#!/bin/bash

# Project setup script
# Usage: ./setup-project.sh [project-name]

PROJECT_NAME=${1:-$(basename "$PWD")}

echo "Setting up project structure for: $PROJECT_NAME"

# Create directories
mkdir -p Session_Archives
mkdir -p Documents  
mkdir -p logs
mkdir -p .vscode

# Create basic .vscode/settings.json if it doesn't exist
if [ ! -f .vscode/settings.json ]; then
    cat > .vscode/settings.json << EOF
{
    "files.exclude": {
        "Session_Archives": false,
        "Documents": false,
        "logs": false
    },
    "explorer.sortOrder": "type"
}
EOF
fi

# Create basic README if it doesn't exist
if [ ! -f README.md ]; then
    cat > README.md << EOF
# $PROJECT_NAME

## Project Structure
- \`Session_Archives/\` - Session and archive files
- \`Documents/\` - Project documentation
- \`logs/\` - Log files

Created: $(date)
EOF
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    cat > .gitignore << EOF
# Logs
logs/*.log
*.log

# Session archives (uncomment if you don't want to track these)
# Session_Archives/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF
fi

echo "✅ Project structure created successfully!"
echo "📁 Created directories: Session_Archives, Documents, logs"
echo "⚙️  Created .vscode/settings.json"
echo "📝 Created README.md and .gitignore"