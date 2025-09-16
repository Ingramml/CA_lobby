#!/bin/bash

# California Lobbying Transparency Web Application Startup Script
# This script helps you start the development environment

set -e

echo "🚀 Starting California Lobbying Transparency Web Application"
echo "============================================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the webapp directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check for environment file
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creating backend environment file..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your configuration before continuing"
    echo "   Required: CREDENTIALS_LOCATION, PROJECT_ID"
    echo ""
    read -p "Press Enter after configuring .env file..."
fi

# Check for Google Cloud credentials
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "⚠️  Warning: GOOGLE_APPLICATION_CREDENTIALS not set"
    echo "   Please set this environment variable to your Google Cloud credentials file"
    echo "   Example: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json"
fi

echo ""
echo "🏗️  Building and starting services..."

# Build and start services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

# Check backend
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend API is running at http://localhost:5000"
else
    echo "❌ Backend API is not responding"
fi

# Check Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not responding"
fi

echo ""
echo "🎉 Application started successfully!"
echo ""
echo "📍 Access Points:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:5000"
echo "   • API Documentation: http://localhost:5000/api/"
echo ""
echo "👤 Demo Accounts:"
echo "   • Guest: guest@ca-lobby.gov / guest"
echo "   • Public: public@ca-lobby.gov / public123"
echo "   • Researcher: researcher@ca-lobby.gov / research123"
echo "   • Journalist: journalist@ca-lobby.gov / journalist123"
echo "   • Admin: admin@ca-lobby.gov / admin123"
echo ""
echo "📚 Useful Commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Restart services: docker-compose restart"
echo "   • Rebuild: docker-compose up --build"
echo ""
echo "🐛 Troubleshooting:"
echo "   • If services fail to start, check docker-compose logs"
echo "   • Ensure .env file is properly configured"
echo "   • Verify Google Cloud credentials are accessible"
echo ""
echo "Happy lobbying data exploring! 🔍📊"