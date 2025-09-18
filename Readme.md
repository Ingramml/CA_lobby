
# CA Lobby Next.js - California Lobbying Transparency Platform

A comprehensive platform for California lobbying disclosure built with Next.js 14, featuring mock data for proof of concept demonstrations.

## 📁 Project Structure

```
CA_lobby-1/
├── 📂 ca-lobby-nextjs/           # Main Next.js 14 Application
│   ├── app/                      # App Router (Next.js 14)
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Utilities and configurations
│   └── public/                   # Static assets
│
├── 📂 subagents/                 # Claude Code Subagents
│   ├── base_agent.py            # Abstract base class
│   ├── general_purpose.py       # Multi-step task automation
│   ├── vercel_deployment_expert.py
│   ├── nextjs_fullstack_expert.py
│   └── ...                      # Specialized AI agents
│
├── 📂 mock-data/                 # Demo Data for Proof of Concept
│   ├── lobbying_payments.json   # Sample payment records
│   ├── dashboard_summary.json   # Dashboard metrics
│   ├── test_users.json          # Role-based test accounts
│   └── data-generator.js        # Dynamic data generation
│
├── 📂 docs/                      # Documentation
│   ├── deployment/               # Deployment guides
│   │   ├── VERCEL_CLI_DEPLOYMENT_GUIDE.md
│   │   ├── VERCEL_WEBSITE_DEPLOYMENT_GUIDE.md
│   │   └── VERCEL_DEPLOYMENT_GUIDE.md
│   ├── guides/                   # Implementation guides
│   │   ├── MOCK_DATA_INTEGRATION_GUIDE.md
│   │   └── CA_LOBBY_NEXT_MIGRATION_PLAN.md
│   └── legacy/                   # Historical documentation
│       ├── CLAUDE_CODE_SUBAGENTS_CATALOG.md
│       └── SUBAGENT_IMPLEMENTATION_ANALYSIS.md
│
├── 📂 Session_Archives/          # Development session records
│   ├── SESSION_ARCHIVE_20250918_ca_lobby_migration.md
│   └── SESSION_SUMMARY_20250918_ca_lobby_migration.md
│
├── 📂 legacy-python-scripts/     # Original Python BigQuery scripts
│   ├── Bignewdownload_2.py      # Data download utilities
│   ├── Bigquery_connection.py   # BigQuery connection setup
│   ├── SQL Queries/             # SQL query templates
│   └── ...                      # Additional Python utilities
│
├── 📂 resources/                 # External resources and documentation
│   └── bln-python-client-readthedocs-io-en-latest.pdf
│
└── 📄 README.md                  # This file
```

## 🚀 Quick Start

### 1. Development Setup
```bash
# Navigate to the Next.js application
cd ca-lobby-nextjs

# Install dependencies
npm install

# Start development server with mock data
NEXT_PUBLIC_MOCK_DATA_MODE=true npm run dev

# Open http://localhost:3000
```

### 2. Deploy to Vercel
Choose your deployment method:

- **Web Interface**: Follow [Website Deployment Guide](docs/deployment/VERCEL_WEBSITE_DEPLOYMENT_GUIDE.md)
- **CLI**: Follow [CLI Deployment Guide](docs/deployment/VERCEL_CLI_DEPLOYMENT_GUIDE.md)

**Note**: All deployment guides have been updated to reflect the new organized project structure with proper file paths.

## 📊 Features

### Current Implementation (Next.js 14)
- **Modern Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Authentication**: Clerk.dev with role-based access control
- **UI Components**: ShadCN UI library
- **Data Visualization**: Recharts for interactive dashboards
- **Mock Data**: Comprehensive fake data for demonstrations
- **Responsive Design**: Mobile-first responsive layout

### Role-Based Access Control
- **Admin**: Full access to all features and user management
- **Analyst**: Analytics, reports, and data analysis tools
- **Data Manager**: Data operations and processing capabilities
- **Viewer**: Read-only access to public information

### Test Accounts (Demo Mode)
- `admin@calobby-demo.gov` - Administrator access
- `analyst@calobby-demo.gov` - Analyst permissions
- `datamanager@calobby-demo.gov` - Data management access
- `viewer@calobby-demo.gov` - Read-only access

## 🛠 Development Tools

### Claude Code Subagents
Specialized AI agents for development assistance:
- **General Purpose**: Multi-step task automation
- **Vercel Expert**: Deployment and platform optimization
- **Next.js Expert**: Full-stack Next.js development
- **Migration Specialist**: Legacy to modern framework migration
- **Authentication Specialist**: Auth system implementation

### Mock Data System
- **Realistic Data**: 5 years of California lobbying data (2020-2024)
- **Growth Patterns**: 12% annual growth with seasonal variations
- **Geographic Coverage**: 11 California counties
- **Categories**: 8 major lobbying categories
- **Dynamic Generation**: JavaScript generator for scaled datasets

## 📈 Data Overview

### Mock Data Statistics
- **Total Payments**: $6.8M year-to-date
- **Growth Rate**: 18.5% year-over-year
- **Active Lobbyists**: 45 across 25 associations
- **Client Coverage**: 234 active clients
- **Geographic Reach**: 11 California counties

### Top Categories
1. **Real Estate & Housing**: $375K (17.5%)
2. **Healthcare**: $340K (15.8%)
3. **Technology & Innovation**: $280K (13.1%)
4. **Energy & Environment**: $265K (12.4%)

## 🔧 Configuration

### Environment Variables
```bash
# Demo Mode Configuration
NEXT_PUBLIC_MOCK_DATA_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_USE_REAL_BIGQUERY=false

# Application Settings
NEXT_PUBLIC_APP_NAME="CA Lobby Demo"
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"

# Authentication (Test Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_demo_key"
CLERK_SECRET_KEY="sk_test_demo_secret"
```

## 📚 Documentation

### Deployment
- [Website Deployment Guide](docs/deployment/VERCEL_WEBSITE_DEPLOYMENT_GUIDE.md) - Step-by-step web interface deployment
- [CLI Deployment Guide](docs/deployment/VERCEL_CLI_DEPLOYMENT_GUIDE.md) - Command-line deployment
- [Complete Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md) - Comprehensive deployment reference

### Implementation
- [Mock Data Integration Guide](docs/guides/MOCK_DATA_INTEGRATION_GUIDE.md) - Integrating fake data for demos
- [Migration Plan](docs/guides/CA_LOBBY_NEXT_MIGRATION_PLAN.md) - Python to Next.js migration strategy

### Legacy
- [Subagents Catalog](docs/legacy/CLAUDE_CODE_SUBAGENTS_CATALOG.md) - Original subagent specifications
- [Implementation Analysis](docs/legacy/SUBAGENT_IMPLEMENTATION_ANALYSIS.md) - Development methodology analysis

## 🎯 Demo Scenarios

### Stakeholder Presentation (15 minutes)
1. **Dashboard Overview** (3 min) - Show key metrics and growth trends
2. **Data Visualization** (4 min) - Interactive charts and filtering
3. **Role-Based Access** (3 min) - Different user permission levels
4. **Technical Features** (3 min) - Mobile responsiveness and performance
5. **Q&A** (2 min) - Address stakeholder questions

### Key Demo Points
- **Impressive Scale**: $6.8M in total lobbying payments
- **Growth Story**: 18.5% year-over-year increase
- **Geographic Coverage**: Statewide California representation
- **Real-time Updates**: Live dashboard with current data
- **Security**: Role-based access with audit trails

## 🚦 Branch Configuration

**Active Branch**: `mini_js`
- Vercel is configured to deploy from the `mini_js` branch
- All latest features and mock data integration included
- Automatic deployments on push to `mini_js`

## 📞 Support

For questions or support:
1. Check the relevant documentation in the `docs/` folder
2. Review session archives for implementation details
3. Use Claude Code subagents for development assistance

---

**Status**: ✅ Ready for deployment and demonstration
**Last Updated**: September 18, 2025
**Version**: v1.0 (Proof of Concept with Mock Data)

## Legacy Information

This project originally downloaded files from [https://biglocalnews.org/] using Python scripts.
The legacy Python scripts have been moved to `legacy-python-scripts/` and the project has been
migrated to a modern Next.js 14 application with mock data for demonstration purposes.