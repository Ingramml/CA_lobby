# Deploy California Lobbying Website to Vercel

## Quick Start (5 minutes)

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
cd /Users/michaelingram/Documents/GitHub/CA_lobby/webapp
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Choose your account
- **Link to existing project?** → No
- **Project name?** → `ca-lobby` (or whatever you prefer)
- **Directory to deploy?** → `.` (current directory)

That's it! Vercel will provide you with a live URL.

## Environment Variables Setup

After deployment, set up your environment variables in Vercel dashboard:

1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add these variables:

### Required Variables
```
FLASK_ENV=production
JWT_SECRET_KEY=your-super-secret-jwt-key-here
GOOGLE_CLOUD_PROJECT=your-project-id
BIGQUERY_DATASET=ca_lobby
```

### Optional Variables (for production)
```
REDIS_URL=redis://your-redis-url
CREDENTIALS_LOCATION=path-to-your-google-credentials
RATE_LIMIT_PER_MINUTE=100
```

## What Happens During Deployment

1. **Frontend**: React app builds automatically and serves from CDN
2. **Backend**: Python Flask API runs as serverless functions
3. **Routing**: API calls to `/api/*` go to Python, everything else to React

## Common Issues & Solutions

### Issue: Build Fails
**Solution**: Check that all dependencies are in package.json and requirements.txt

### Issue: API Not Working
**Solution**: Ensure environment variables are set in Vercel dashboard

### Issue: BigQuery Connection Fails
**Solution**: Add your Google Cloud credentials as environment variables

## Local Development vs Production

- **Local**: Frontend runs on :3000, backend on :5000
- **Vercel**: Everything runs on your Vercel domain (e.g., ca-lobby.vercel.app)

## Updating Your Site

Simply run:
```bash
vercel --prod
```

Or push to your connected Git repository (Vercel will auto-deploy).

## Free Tier Limits

Vercel's free tier includes:
- 100GB bandwidth per month
- 100 serverless function invocations per day
- Unlimited static file serving

Perfect for testing and small-scale deployment!

## Next Steps After Deployment

1. **Test all features** with the demo accounts:
   - guest@ca-lobby.gov / guest
   - researcher@ca-lobby.gov / research123

2. **Set up custom domain** (optional):
   - Go to project settings → Domains
   - Add your custom domain

3. **Monitor usage**:
   - Check Vercel dashboard for performance metrics
   - Monitor serverless function usage

## Support

If you run into issues:
1. Check Vercel deployment logs in the dashboard
2. Verify environment variables are set correctly
3. Test locally first with `npm start` in frontend/ and `python app.py` in backend/

Your California lobbying transparency website will be live and accessible to the public!