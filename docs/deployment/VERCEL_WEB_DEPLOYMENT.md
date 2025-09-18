# Deploy to Vercel via Web Interface - Step by Step Guide

## Prerequisites
- GitHub repository with your webapp code
- Vercel account (free tier is sufficient)
- Root vercel.json configuration file is properly set up
- Node.js 18+ for the React frontend
- Python 3.9 runtime for serverless functions

## Step-by-Step Deployment Instructions

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in to your Vercel account
3. Click the **"New Project"** button (or **"Add New..." → "Project"**)

### Step 2: Import Your GitHub Repository
1. **Connect GitHub Account** (if not already connected):
   - Click "Continue with GitHub"
   - Authorize Vercel to access your repositories

2. **Select Your Repository**:
   - Find your **CA_lobby** repository in the list
   - Click **"Import"** next to it

### Step 3: Configure Project Settings
1. **Project Configuration Screen**:
   - **Project Name**: `ca-lobby` (or choose your preferred name)
   - **Framework Preset**: Select **"Other"** (custom React + Python setup)
   - **Root Directory**: Leave as **"/"** (root)
   - **Build and Output Settings**:
     - Build Command: `cd webapp/frontend && npm run build`
     - Output Directory: `webapp/frontend/build`
     - Install Command: `npm install --prefix webapp/frontend`
     - Node.js Version: `18.x` (or latest LTS)

### Step 4: Set Environment Variables
Before deploying, click **"Environment Variables"** and add:

**Required Variables:**
| Name | Value | Environment |
|------|-------|-------------|
| `FLASK_ENV` | `production` | Production |
| `JWT_SECRET_KEY` | `your-secure-jwt-secret-key-2025` | Production |
| `PYTHONPATH` | `./webapp/backend` | Production |

**Optional Variables (for demo mode):**
| Name | Value | Environment |
|------|-------|-------------|
| `USE_MOCK_DATA` | `true` | Production |

**For Production BigQuery Integration:**
| Name | Value | Environment |
|------|-------|-------------|
| `GOOGLE_CLOUD_PROJECT` | `your-project-id` | Production |
| `BIGQUERY_DATASET` | `ca_lobby` | Production |
| `CREDENTIALS_LOCATION` | `/path/to/credentials.json` | Production |

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

## Expected Results

**Live Application Features:**
- California Lobbying Transparency Dashboard
- Advanced search interface with multiple filters
- Pre-built and custom reports
- Data export functionality
- Responsive design for all devices
- JWT-based authentication system

**API Endpoints:**
- All `/api/*` routes handled by Python Flask serverless functions
- 30-second timeout for complex queries
- CORS properly configured for frontend-backend communication

## Sharing Your Application

Once deployed, you can share the Vercel URL with:
- Colleagues and stakeholders
- Potential users for feedback
- As a portfolio piece
- For demonstration purposes

## Troubleshooting

### 2025 Vercel Platform Notes
- Functions automatically scale with zero cold start
- Edge runtime available for improved performance
- Automatic HTTPS and CDN distribution
- Built-in analytics and monitoring

**If deployment fails:**
1. Check build logs in Vercel dashboard
2. Ensure vercel.json is in the root directory
3. Verify Node.js version compatibility (18+)
4. Check that requirements.txt exists in webapp/backend/
5. Confirm all dependencies are properly listed

**If site loads but API doesn't work:**
1. Check Function logs in Vercel dashboard
2. Verify `/api/*` routes are accessible
3. Confirm Python 3.9 runtime is working
4. Check serverless function timeout (30s max)
5. Validate environment variables in dashboard

**Common 2025 Issues:**
- **Cold starts**: Use Edge Runtime for faster startup
- **Function timeouts**: Optimize queries or use streaming
- **CORS errors**: Verify frontend/backend origins match
- **Build failures**: Check Node.js and Python versions

## Updates and Redeployment

**For future updates:**
1. Make changes to your code locally
2. Test locally with `npm start` (frontend) and `python app.py` (backend)
3. Commit and push to GitHub
4. Vercel will automatically redeploy from your main branch
5. Use preview deployments for feature branches
6. Monitor deployment status in Vercel dashboard

**Performance Optimization (2025 Best Practices):**
- Enable Edge Functions for faster API responses
- Use Vercel Analytics for real-time monitoring
- Implement ISR (Incremental Static Regeneration) for dynamic data
- Leverage Vercel's Image Optimization for better performance
- Use Edge Config for global configuration management

Your California Lobbying Transparency application will be live with enterprise-grade performance and reliability!