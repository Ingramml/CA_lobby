# Deploy California Lobbying Website to Vercel (CLI Method)

## Quick Start (5 minutes)

**Prerequisites:**
- Node.js 18+ installed
- Git repository with latest changes committed
- Vercel account (free tier sufficient)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
- Choose your preferred login method (GitHub, email, etc.)

### Step 3: Deploy
```bash
# Navigate to project root (not webapp subdirectory)
cd /Users/michaelingram/Documents/GitHub/CA_lobby
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Choose your account
- **Link to existing project?** → No (for first deployment)
- **Project name?** → `ca-lobby` (or your preferred name)
- **In which directory is your code located?** → `./` (root directory)

**Note**: Vercel will automatically detect your `vercel.json` configuration file and use the specified build settings.

That's it! Vercel will provide you with a live URL.

## Environment Variables Setup

You can set environment variables either through the CLI or Vercel dashboard:

### Option 1: CLI Method (Recommended for 2025)
```bash
# Set required variables
vercel env add FLASK_ENV production
vercel env add JWT_SECRET_KEY your-secure-jwt-secret-2025
vercel env add PYTHONPATH ./webapp/backend

# For demo mode (optional)
vercel env add USE_MOCK_DATA true

# For BigQuery integration (production)
vercel env add GOOGLE_CLOUD_PROJECT your-project-id
vercel env add BIGQUERY_DATASET ca_lobby
```

### Option 2: Dashboard Method
1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add the same variables as shown above

### Required Variables
- `FLASK_ENV`: Set to `production`
- `JWT_SECRET_KEY`: Secure secret key for JWT tokens
- `PYTHONPATH`: Set to `./webapp/backend`

### Optional Variables
- `USE_MOCK_DATA`: Set to `true` for demo mode
- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud project ID
- `BIGQUERY_DATASET`: Dataset name (typically `ca_lobby`)
- `CREDENTIALS_LOCATION`: Path to Google Cloud credentials

## What Happens During Deployment

1. **Build Process**:
   - Vercel reads your `vercel.json` configuration
   - Frontend builds: `cd webapp/frontend && npm run build`
   - Output served from: `webapp/frontend/build`

2. **Serverless Functions**:
   - Python Flask app (`webapp/backend/app.py`) becomes serverless function
   - Runtime: Python 3.9
   - Max duration: 30 seconds
   - Auto-scaling with zero configuration

3. **Routing (2025 Configuration)**:
   - `/api/*` requests → Python Flask serverless function
   - All other requests → React app (SPA routing)
   - Automatic HTTPS and global CDN
   - Edge locations for optimal performance

## Common Issues & Solutions (2025 Updated)

### Issue: Build Fails
**Solutions**:
- Verify `package.json` exists in `webapp/frontend/`
- Check `requirements.txt` exists in `webapp/backend/`
- Ensure Node.js version is 18+ compatible
- Verify `vercel.json` is in project root

### Issue: Function Timeouts
**Solutions**:
- Optimize database queries (30s max duration)
- Use connection pooling for BigQuery
- Consider Edge Runtime for faster startup
- Implement request caching where appropriate

### Issue: API Not Working
**Solutions**:
- Check Function logs in Vercel dashboard
- Verify environment variables are set correctly
- Test API endpoints with `curl` or Postman
- Ensure CORS configuration allows frontend domain

### Issue: Cold Start Performance
**Solutions** (2025 Best Practices):
- Use Edge Runtime: Add `"runtime": "edge"` to function config
- Implement connection reuse in Python
- Consider Vercel's Serverless Function warming
- Use Edge Config for frequently accessed data

## Local Development vs Production

### Local Environment
- **Frontend**: React dev server on `http://localhost:3000`
- **Backend**: Flask dev server on `http://localhost:5000`
- **API Proxy**: Frontend proxies `/api/*` to backend

### Vercel Production Environment
- **Frontend**: Served from global CDN
- **Backend**: Serverless functions in AWS Lambda
- **Domain**: Your assigned Vercel domain (e.g., `ca-lobby.vercel.app`)
- **HTTPS**: Automatic SSL certificate
- **Performance**: Edge locations worldwide

## Updating Your Site (2025 Workflow)

### Manual Deployment
```bash
# Deploy to preview (for testing)
vercel

# Deploy to production
vercel --prod
```

### Automatic Deployment (Recommended)
1. Connect your Git repository in Vercel dashboard
2. Push to main branch for automatic production deployment
3. Push to feature branches for automatic preview deployments
4. Use pull request previews for team collaboration

### Advanced 2025 Features
```bash
# Deploy with specific alias
vercel --prod --alias ca-lobby-production.vercel.app

# Deploy with environment promotion
vercel promote <deployment-url> --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>
```

## Free Tier Limits (2025 Updated)

Vercel's Hobby tier includes:
- **Bandwidth**: 100GB per month
- **Serverless Function Executions**: 100GB-hours per month
- **Serverless Function Duration**: 10 seconds max (30s with Pro)
- **Build Time**: 6 hours per month
- **Static File Serving**: Unlimited
- **Custom Domains**: Unlimited
- **SSL Certificates**: Automatic and free

**Note**: Your app uses 30-second functions, which requires Pro tier ($20/month) for full functionality.

## Next Steps After Deployment

1. **Test Application Functionality**:
   - Verify dashboard loads correctly
   - Test search functionality
   - Check API endpoints respond properly
   - Validate data export features

2. **Set up Custom Domain** (optional):
   ```bash
   # Via CLI
   vercel domains add yourdomain.com

   # Or via dashboard: Settings → Domains
   ```

3. **Monitor Performance** (2025 Tools):
   - **Vercel Analytics**: Real-time performance metrics
   - **Function Logs**: Debug serverless function issues
   - **Edge Network**: Monitor global CDN performance
   - **Core Web Vitals**: Track user experience metrics

4. **Production Optimizations**:
   - Enable Vercel Analytics for detailed insights
   - Set up monitoring alerts for function errors
   - Configure caching strategies for API responses
   - Implement error tracking (Sentry integration)

## Support and Troubleshooting

### Debugging Steps
1. **Check Deployment Status**:
   ```bash
   vercel ls
   vercel inspect <deployment-url>
   ```

2. **View Logs**:
   ```bash
   vercel logs <deployment-url>
   vercel logs --follow  # Real-time logs
   ```

3. **Local Testing**:
   ```bash
   # Frontend
   cd webapp/frontend && npm start

   # Backend
   cd webapp/backend && python app.py
   ```

4. **Verify Configuration**:
   - Check `vercel.json` syntax
   - Validate environment variables
   - Test function endpoints locally

### Additional Resources (2025)
- **Vercel CLI Documentation**: https://vercel.com/docs/cli
- **Serverless Functions Guide**: https://vercel.com/docs/functions
- **Edge Runtime**: https://vercel.com/docs/functions/edge-runtime
- **Performance Monitoring**: https://vercel.com/docs/analytics

Your California lobbying transparency website will be live with enterprise-grade performance, security, and global availability!