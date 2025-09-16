# Deploy to Vercel via Web Interface - Step by Step Guide

## 📋 Prerequisites
- [x] GitHub repository with your webapp code
- [x] Vercel account (free tier is sufficient)
- [x] All configuration files are ready

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in to your Vercel account
3. Click the **"New Project"** button (or **"Add New..." → "Project"**)

### Step 2: Import Your GitHub Repository
1. **Connect GitHub Account** (if not already connected):
   - Click "Continue with GitHub"
   - Authorize Vercel to access your repositories

2. **Select Your Repository**:
   - Find **"Ingramml/CA_lobby"** in the repository list
   - Click **"Import"** next to it

### Step 3: Configure Project Settings
1. **Project Configuration Screen**:
   - **Project Name**: `ca-lobby-demo` (or choose your preferred name)
   - **Framework Preset**: Select **"Other"** (since it's a custom setup)
   - **Root Directory**: Leave as **"/"** (root)
   - **Build and Output Settings**:
     - Build Command: `cd webapp/frontend && npm install && npm run build`
     - Output Directory: `webapp/frontend/build`
     - Install Command: `cd webapp/frontend && npm install`

### Step 4: Set Environment Variables
Before deploying, click **"Environment Variables"** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `FLASK_ENV` | `production` | Production |
| `JWT_SECRET_KEY` | `ca-lobby-demo-jwt-secret-2024` | Production |
| `USE_MOCK_DATA` | `true` | Production |
| `PYTHONPATH` | `./webapp/backend` | Production |

### Step 5: Deploy
1. Click **"Deploy"** button
2. Wait for the build process (usually 2-3 minutes)
3. Vercel will show build logs in real-time

### Step 6: Access Your Live Demo
Once deployment is complete:
1. Vercel will provide a live URL like: `https://ca-lobby-demo-xxx.vercel.app`
2. Click the URL to view your live demo site
3. Test the functionality:
   - Dashboard should load automatically (no login required)
   - Navigate to Search and Reports sections
   - All features should work with mock data

## 🎯 Expected Results

**✅ Live Demo Features:**
- California Lobbying Transparency Dashboard
- Advanced search interface with 3 tabs
- Pre-built and custom reports
- Export functionality (mock)
- Responsive design for all devices

**✅ Demo Accounts** (automatically logged in as Admin):
- Full access to all features
- No authentication required for testing

## 📱 Sharing Your Demo

Once deployed, you can share the Vercel URL with:
- Colleagues and stakeholders
- Potential users for feedback
- As a portfolio piece
- For demonstration purposes

## 🔧 Troubleshooting

**If deployment fails:**
1. Check build logs in Vercel dashboard
2. Ensure all files were committed to GitHub
3. Verify environment variables are set correctly

**If site loads but features don't work:**
1. Check browser console for errors
2. Verify API routes are accessible at `/api/`
3. Confirm environment variables are applied

## 🔄 Updates and Redeployment

**For future updates:**
1. Make changes to your code locally
2. Commit and push to GitHub
3. Vercel will automatically redeploy (if auto-deployment is enabled)
4. Or manually redeploy from Vercel dashboard

Your California Lobbying Transparency demo site will be live and ready to showcase!