# CA Lobby Next.js - Vercel CLI Deployment Guide

This guide covers deploying the CA Lobby Next.js application using the Vercel Command Line Interface (CLI).

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [CLI Installation and Setup](#2-cli-installation-and-setup)
3. [Project Preparation](#3-project-preparation)
4. [CLI Deployment Process](#4-cli-deployment-process)
5. [Environment Configuration via CLI](#5-environment-configuration-via-cli)
6. [Production Deployment](#6-production-deployment)
7. [Monitoring and Management](#7-monitoring-and-management)
8. [Troubleshooting CLI Issues](#8-troubleshooting-cli-issues)

---

## 1. Prerequisites

### 1.1 Required Tools
```bash
# Node.js 18.x or higher
node --version  # Should be 18.x

# npm or yarn
npm --version

# Git (for version control)
git --version
```

### 1.2 Project Structure Verification
```bash
# Ensure you're in the CA Lobby project directory
cd /Users/michaelingram/Documents/GitHub/CA_lobby-1

# Verify project structure
ls -la
# Should show: ca-lobby-nextjs/, docs/, mock-data/, subagents/, legacy-python-scripts/, etc.

# Navigate to the Next.js application
cd ca-lobby-nextjs
```

### 1.3 Build Test
```bash
# Test local build
npm install
npm run build

# Test development server
npm run dev
# Visit http://localhost:3000 to verify functionality
```

---

## 2. CLI Installation and Setup

### 2.1 Install Vercel CLI
```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version
```

### 2.2 Authentication
```bash
# Login to Vercel account
vercel login

# Follow the authentication flow:
# - Choose your preferred method (Email, GitHub, GitLab, Bitbucket)
# - Complete the authentication in your browser
# - Return to terminal when prompted
```

### 2.3 Team Selection (if applicable)
```bash
# List available teams
vercel teams list

# Switch to specific team (if needed)
vercel teams switch <team-name>
```

---

## 3. Project Preparation

### 3.1 Environment Variables Setup
Create `.env.local` for local development:

```bash
# ca-lobby-nextjs/.env.local
NEXT_PUBLIC_MOCK_DATA_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="CA Lobby Dashboard"

# Authentication (use test keys for development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_test_key
CLERK_SECRET_KEY=sk_test_your_test_secret

# Mock data configuration
NEXT_PUBLIC_USE_REAL_BIGQUERY=false
NEXT_PUBLIC_DEMO_MODE=true

# Optional: Real BigQuery for testing
GOOGLE_CLOUD_PROJECT_ID=your-test-project
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### 3.2 Production Environment Variables
Create `ca-lobby-nextjs/.env.production.example`:

```bash
# Production environment variables template
NEXT_PUBLIC_APP_URL=https://ca-lobby.vercel.app
NEXT_PUBLIC_APP_NAME="CA Lobby Dashboard"

# Authentication (production keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret

# BigQuery (production)
GOOGLE_CLOUD_PROJECT_ID=your-production-project
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
BIGQUERY_DATASET=ca_lobby_data
BIGQUERY_TABLE_PREFIX=prod_

# Vercel Services
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### 3.3 Vercel Configuration
Ensure `ca-lobby-nextjs/vercel.json` is properly configured:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/bigquery/*/route.js": {
      "maxDuration": 30,
      "memory": 1024
    },
    "app/api/health/route.js": {
      "maxDuration": 10,
      "memory": 512
    }
  },
  "crons": [
    {
      "path": "/api/cron/health-check",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## 4. CLI Deployment Process

### 4.1 Initial Project Setup
```bash
# Navigate to Next.js project directory
cd ca-lobby-nextjs

# Initialize Vercel project
vercel

# Follow the prompts:
# ? Set up and deploy "~/ca-lobby-nextjs"? [Y/n] Y
# ? Which scope do you want to deploy to? [Select your account/team]
# ? Link to existing project? [y/N] N
# ? What's your project's name? ca-lobby-nextjs
# ? In which directory is your code located? ./
```

### 4.2 First Deployment (Development)
```bash
# Deploy to development environment
vercel

# This will:
# - Build your application
# - Deploy to a preview URL
# - Provide a deployment URL like: https://ca-lobby-nextjs-abc123.vercel.app
```

### 4.3 Preview Deployment
```bash
# Deploy specific branch to preview
vercel --branch feature-branch

# Deploy with specific environment
vercel --env NODE_ENV=staging

# Deploy with build command override
vercel --build-env NODE_ENV=production
```

---

## 5. Environment Configuration via CLI

### 5.1 Add Environment Variables
```bash
# Add environment variables for all environments
vercel env add NEXT_PUBLIC_APP_NAME

# Add environment variable for specific environment
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_SECRET_KEY preview
vercel env add CLERK_SECRET_KEY development

# Add from file
vercel env add < .env.production.example
```

### 5.2 List and Manage Environment Variables
```bash
# List all environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME

# Update environment variable
vercel env add VARIABLE_NAME  # This will prompt to overwrite
```

### 5.3 Bulk Environment Variable Setup
```bash
# Set up all required variables
vercel env add NEXT_PUBLIC_MOCK_DATA_MODE production
# Enter: true

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://ca-lobby-nextjs.vercel.app

vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Enter: your_production_clerk_key

vercel env add CLERK_SECRET_KEY production
# Enter: your_production_clerk_secret

# Continue for all required variables...
```

---

## 6. Production Deployment

### 6.1 Production Deployment Command
```bash
# Deploy to production
vercel --prod

# Deploy specific branch to production
vercel --prod --branch mini_js

# Deploy with confirmation
vercel --prod --confirm
```

### 6.2 Custom Domain Setup via CLI
```bash
# Add custom domain
vercel domains add ca-lobby.yourdomain.com

# List domains
vercel domains ls

# Remove domain
vercel domains rm ca-lobby.yourdomain.com
```

### 6.3 Alias Management
```bash
# Create alias
vercel alias https://ca-lobby-nextjs-abc123.vercel.app ca-lobby.vercel.app

# List aliases
vercel alias ls

# Remove alias
vercel alias rm ca-lobby.vercel.app
```

---

## 7. Monitoring and Management

### 7.1 Deployment Monitoring
```bash
# List all deployments
vercel ls

# Get deployment details
vercel inspect https://ca-lobby-nextjs-abc123.vercel.app

# Check deployment logs
vercel logs https://ca-lobby-nextjs.vercel.app

# Follow logs in real-time
vercel logs https://ca-lobby-nextjs.vercel.app --follow
```

### 7.2 Function Management
```bash
# List serverless functions
vercel functions ls

# Get function logs
vercel logs --filter="api/health"

# Function metrics
vercel inspect https://ca-lobby-nextjs.vercel.app --functions
```

### 7.3 Performance Monitoring
```bash
# Check build performance
vercel build --debug

# Analyze bundle
ANALYZE=true vercel build

# Performance insights (requires dashboard)
echo "Visit https://vercel.com/dashboard to view Speed Insights"
```

---

## 8. Troubleshooting CLI Issues

### 8.1 Common CLI Problems

**Authentication Issues:**
```bash
# Re-authenticate
vercel logout
vercel login

# Check authentication status
vercel whoami
```

**Build Failures:**
```bash
# Clear local cache
rm -rf .vercel .next node_modules
npm install

# Debug build locally
vercel build --debug

# Check build logs
vercel logs https://your-deployment-url.vercel.app --filter="build"
```

**Deployment Failures:**
```bash
# Force redeploy
vercel --force

# Deploy with verbose output
vercel --debug

# Check project configuration
cat .vercel/project.json
```

### 8.2 Environment Variable Issues
```bash
# Verify environment variables are set
vercel env ls

# Test environment variables locally
vercel env pull .env.local
npm run dev

# Check production environment
vercel env ls --environment production
```

### 8.3 Function Timeout Issues
```bash
# Check function configuration
cat vercel.json

# Update function timeout
# Edit vercel.json and redeploy
vercel --prod
```

---

## Quick CLI Reference

### Essential Commands
```bash
# Basic deployment workflow
vercel login                          # Authenticate
vercel                               # Deploy to preview
vercel --prod                        # Deploy to production

# Environment management
vercel env add VARIABLE_NAME         # Add environment variable
vercel env ls                        # List all variables
vercel env rm VARIABLE_NAME          # Remove variable

# Deployment management
vercel ls                            # List deployments
vercel logs URL                      # View logs
vercel rollback URL                  # Rollback deployment

# Project management
vercel projects ls                   # List projects
vercel projects rm PROJECT_NAME      # Remove project
vercel link                         # Link to existing project

# Domain management
vercel domains add DOMAIN            # Add custom domain
vercel domains ls                    # List domains
vercel alias URL ALIAS              # Create alias
```

### Deployment Checklist
```bash
# Pre-deployment checklist
- [ ] npm run build (successful)
- [ ] npm run type-check (no errors)
- [ ] Environment variables configured
- [ ] vercel.json properly configured
- [ ] Dependencies up to date

# Deployment steps
1. vercel env add (configure environment variables)
2. vercel (preview deployment)
3. Test preview deployment
4. vercel --prod (production deployment)
5. Test production deployment
6. Configure custom domain (if needed)
```

---

This CLI deployment guide provides comprehensive coverage of deploying the CA Lobby Next.js application using Vercel's command-line interface, with specific attention to the project's BigQuery integration and authentication requirements.