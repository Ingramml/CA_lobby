# CA Lobby Dashboard - Deployment Guide

## Vercel Deployment Instructions

### 1. Environment Variables Setup

Before deploying, you need to set up Clerk authentication:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or use an existing one
3. Get your API keys from the API Keys page

### 2. Environment Variables in Vercel

In your Vercel dashboard, add the following environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 3. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Add the environment variables listed above
6. Deploy

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables (follow prompts)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
# ... add other env vars

# Redeploy with new environment variables
vercel --prod
```

### 4. Configure Clerk for Production

In your Clerk dashboard:

1. Go to "Domains" section
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Update any redirect URLs if needed

### 5. Test Your Deployment

1. Visit your deployed URL
2. Test sign-up functionality
3. Test sign-in functionality
4. Verify dashboard access
5. Test sign-out functionality

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Add your Clerk keys to .env.local

# Run development server
npm run dev
```

## Build and Test Locally

```bash
# Test build
npm run build

# Run production build locally
npm run start
```