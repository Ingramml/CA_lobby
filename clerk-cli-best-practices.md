# Clerk CLI Best Practices

## Table of Contents
1. [CLI Tools Overview](#cli-tools-overview)
2. [Installation & Setup](#installation--setup)
3. [Development Workflow](#development-workflow)
4. [Upgrade Management](#upgrade-management)
5. [Environment Management](#environment-management)
6. [Automation & CI/CD](#automation--cicd)
7. [Troubleshooting](#troubleshooting)

## CLI Tools Overview

Clerk provides several CLI tools for different purposes:

### Primary CLI Tools
- **@clerk/upgrade**: Main CLI for upgrading Clerk SDKs and managing breaking changes
- **@clerk/dev-cli**: Development CLI for monorepo package iteration and hot reloading
- **shadcn/ui CLI**: Integration tool for bootstrapping Next.js apps with Clerk components

### Tool Selection Guide
```bash
# For SDK upgrades and migration
npx @clerk/upgrade

# For development with clerk/javascript monorepo
npm i @clerk/dev-cli

# For Next.js + shadcn/ui integration
npx shadcn-ui@latest init
```

## Installation & Setup

### System Requirements
- **Node.js 18.17.0 or later** (Node.js 16 is EOL and no longer supported)
- **npm, yarn, or pnpm** package manager
- **Git** for version control integration

### Global vs Local Installation

#### Recommended: Use npx (No installation needed)
```bash
# Always uses latest version
npx @clerk/upgrade
npx @clerk/dev-cli
```

#### Alternative: Global Installation
```bash
# Install globally for repeated use
npm install -g @clerk/upgrade
npm install -g @clerk/dev-cli

# Usage after global install
clerk-upgrade
clerk-dev
```

#### Project-Specific Installation
```bash
# Add to project dependencies
npm install @clerk/dev-cli --save-dev

# Use via npm scripts
"scripts": {
  "upgrade-clerk": "npx @clerk/upgrade",
  "dev-clerk": "clerk-dev"
}
```

## Development Workflow

### Project Initialization with CLI

#### New Next.js Project with Clerk
```bash
# Create new Next.js app
npm create next-app@latest my-clerk-app -- --yes

# Navigate to project
cd my-clerk-app

# Install Clerk
npm install @clerk/nextjs

# Run upgrade tool to ensure latest patterns
npx @clerk/upgrade
```

#### With shadcn/ui Integration
```bash
# Initialize Next.js with TypeScript and Tailwind
npm create next-app@latest my-app --typescript --tailwind --eslint

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add Clerk components via shadcn registry
npx shadcn-ui@latest add clerk-auth
```

### Development CLI Workflow (@clerk/dev-cli)

#### Initial Setup
```bash
# Install development CLI
npm install @clerk/dev-cli

# Initialize configuration
npx @clerk/dev-cli init

# Configure monorepo path
npx @clerk/dev-cli config set repo-path /path/to/clerk/javascript
```

#### Hot Module Reloading Setup
```bash
# Start development with HMR
npx @clerk/dev-cli dev

# Install monorepo packages
npx @clerk/dev-cli install

# Watch for changes
npx @clerk/dev-cli watch
```

### CLI Command Patterns

#### Pre-commit Hooks with CLI
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx @clerk/upgrade --check"
    }
  }
}
```

#### Development Scripts
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "clerk:upgrade": "npx @clerk/upgrade",
    "clerk:check": "npx @clerk/upgrade --dry-run",
    "clerk:dev": "npx @clerk/dev-cli dev",
    "prepare": "npx @clerk/upgrade --check"
  }
}
```

## Upgrade Management

### @clerk/upgrade CLI Best Practices

#### Pre-Upgrade Checklist
```bash
# Check current Clerk version
npm list @clerk/nextjs

# Create backup branch
git checkout -b backup-before-clerk-upgrade

# Run dry-run to see what will change
npx @clerk/upgrade --dry-run

# Review breaking changes documentation
# Check Clerk's migration guide for your version
```

#### Upgrade Process
```bash
# Run interactive upgrade
npx @clerk/upgrade

# Answer questionnaire about your setup
# Follow framework-specific prompts
# Review generated change list

# Manual verification after upgrade
npm run type-check
npm run lint
npm run test
```

#### Post-Upgrade Validation
```bash
# Verify installation
npm run build

# Test authentication flows
npm run dev

# Check for any missed migrations
npx @clerk/upgrade --verify

# Commit changes
git add .
git commit -m "chore: upgrade Clerk to latest version"
```

### Version Management Strategy

#### Semantic Versioning Alignment
```bash
# Check for major version updates quarterly
npx @clerk/upgrade --check-major

# Minor updates monthly
npx @clerk/upgrade --check-minor

# Patch updates as needed
npx @clerk/upgrade --check-patch
```

#### Multi-Environment Upgrades
```bash
# Development first
npx @clerk/upgrade
npm run test

# Staging deployment
git push origin feature/clerk-upgrade
# Deploy to staging, test thoroughly

# Production deployment
git merge feature/clerk-upgrade
# Deploy to production with monitoring
```

## Environment Management

### CLI Configuration per Environment

#### Environment-Specific Commands
```bash
# Development environment setup
CLERK_ENV=development npx @clerk/upgrade

# Staging environment
CLERK_ENV=staging npx @clerk/upgrade

# Production environment
CLERK_ENV=production npx @clerk/upgrade
```

#### Configuration Files
```javascript
// clerk.config.js
module.exports = {
  development: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_DEV,
    secretKey: process.env.CLERK_SECRET_KEY_DEV
  },
  staging: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_STAGING,
    secretKey: process.env.CLERK_SECRET_KEY_STAGING
  },
  production: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_PROD,
    secretKey: process.env.CLERK_SECRET_KEY_PROD
  }
}
```

### CLI Environment Validation
```bash
# Validate environment setup
npx @clerk/upgrade --validate-env

# Check API key format
npx @clerk/upgrade --check-keys

# Verify configuration
npx @clerk/upgrade --verify-config
```

## Automation & CI/CD

### CI/CD Pipeline Integration

#### GitHub Actions Example
```yaml
# .github/workflows/clerk-upgrade.yml
name: Clerk Upgrade Check
on:
  schedule:
    - cron: '0 9 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  check-clerk-updates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Check for Clerk updates
        run: npx @clerk/upgrade --check --format=json > upgrade-check.json

      - name: Create PR if updates available
        if: success()
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: Clerk SDK updates available'
          body: 'Automated Clerk upgrade check found available updates'
          branch: 'automated/clerk-upgrade'
```

#### Pre-deployment Hooks
```bash
# .deploymentrc
#!/bin/bash
echo "Running pre-deployment Clerk checks..."

# Verify Clerk configuration
npx @clerk/upgrade --verify

# Check for breaking changes
npx @clerk/upgrade --check-breaking

# Validate environment variables
npx @clerk/upgrade --validate-env

echo "Clerk pre-deployment checks completed"
```

### Automated Testing with CLI
```bash
# Test script integration
#!/bin/bash
set -e

echo "Running Clerk CLI tests..."

# Check current configuration
npx @clerk/upgrade --check-config

# Validate all environments
for env in development staging production; do
  echo "Validating $env environment..."
  CLERK_ENV=$env npx @clerk/upgrade --validate
done

echo "All Clerk CLI tests passed"
```

## Troubleshooting

### Common CLI Issues and Solutions

#### Installation Problems
```bash
# Clear npm cache
npm cache clean --force

# Use alternative installation method
npx --yes @clerk/upgrade

# Check Node.js version
node --version # Should be 18.17.0+

# Verify npm registry
npm config get registry
```

#### Permission Issues
```bash
# macOS/Linux permission fix
sudo chown -R $(whoami) ~/.npm

# Windows permission fix (run as administrator)
npm install -g @clerk/upgrade

# Alternative: use npx (recommended)
npx @clerk/upgrade
```

#### Network/Proxy Issues
```bash
# Configure npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Use yarn instead of npm
yarn global add @clerk/upgrade

# Direct download approach
curl -fsSL https://unpkg.com/@clerk/upgrade/bin/upgrade.js | node
```

### Debugging CLI Operations

#### Verbose Logging
```bash
# Enable debug mode
DEBUG=clerk:* npx @clerk/upgrade

# Verbose output
npx @clerk/upgrade --verbose

# Log to file
npx @clerk/upgrade --log-file=clerk-upgrade.log
```

#### Configuration Debugging
```bash
# Check current configuration
npx @clerk/upgrade --show-config

# Validate configuration files
npx @clerk/upgrade --validate-config

# Test API connectivity
npx @clerk/upgrade --test-connection
```

### Recovery Procedures

#### Rollback Failed Upgrades
```bash
# Git-based rollback
git checkout HEAD~1 package.json package-lock.json
npm install

# Specific version rollback
npm install @clerk/nextjs@4.29.9

# Verify rollback
npx @clerk/upgrade --check-version
```

#### Reset CLI Configuration
```bash
# Clear CLI cache
npx @clerk/upgrade --clear-cache

# Reset configuration
npx @clerk/upgrade --reset-config

# Reinitialize
npx @clerk/upgrade --init
```

### Support and Diagnostics

#### Generate Support Bundle
```bash
# Create diagnostic report
npx @clerk/upgrade --diagnostic

# Include system information
npx @clerk/upgrade --system-info

# Generate full report
npx @clerk/upgrade --support-bundle
```

#### Community Resources
- **GitHub Issues**: Report CLI bugs and feature requests
- **Discord Community**: Real-time help from Clerk community
- **Documentation**: Official CLI documentation updates
- **Stack Overflow**: Tagged questions for complex scenarios

This comprehensive CLI guide ensures efficient, reliable, and scalable Clerk management through command-line tools and automation.