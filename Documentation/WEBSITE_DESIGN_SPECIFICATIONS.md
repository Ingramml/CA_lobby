# California Lobbying Data Website - Design Specifications

## Overview

This document outlines the complete design specifications for a web application that provides public access to California lobbying data stored in Google BigQuery. The website will serve researchers, journalists, and the general public with intuitive search capabilities and comprehensive reporting tools.

## User Interface Design

### 1. Login Page
**Layout**: Centered card design with clean authentication form

**Features**:
- Role-based access selection:
  - **Researcher**: Full access to advanced analytics
  - **Journalist**: Enhanced search and export capabilities
  - **Public**: Basic search and viewing access
  - **Admin**: System management and user controls
- Guest access for basic public data
- "Forgot Password" and "Register" options
- California state branding elements

**Security**:
- Session management with timeout
- Password complexity requirements
- Optional 2FA for admin users

### 2. Home Dashboard
**Layout**: Modern dashboard with widget-based design

**Components**:
- **Header Navigation**: Logo, user profile, search bar, logout
- **Quick Stats Cards**:
  - Total active filings
  - Recent payment amounts
  - Number of active lobbyists
  - Latest reporting period
- **Recent Activity Feed**: Latest submissions and amendments
- **Featured Reports**: Links to popular pre-built analyses
- **Quick Search Bar**: Smart search with auto-suggestions

### 3. Advanced Search Interface

#### Search Tabs Design
Multi-tab interface for organized searching:

**Tab 1: Entity Search**
- **Filer Information**:
  - Filer Name (autocomplete)
  - Firm Name (autocomplete)
  - Employer Name (autocomplete)
- **Geographic Filters**:
  - County dropdown (multi-select)
  - City filter (conditional on county)
- **Registration Status**:
  - Active/Inactive toggle
  - Registration date range

**Tab 2: Financial Search**
- **Payment Filters**:
  - Amount range sliders (min/max)
  - Payment type checkboxes:
    - Lobbying fees
    - Reimbursements
    - Advances
    - Other payments
- **Date Filters**:
  - Report date range picker
  - Payment date range picker
  - Filing period dropdown

**Tab 3: Filing Search**
- **Document Filters**:
  - Filing ID exact search
  - Amendment tracking toggle
  - Document type multi-select:
    - Disclosure forms
    - Registration forms
    - Payment records
    - Employment records
- **Status Filters**:
  - Original vs. amended filings
  - Latest amendment only toggle

#### Search Results Display
**Layout**: Responsive table with expandable rows

**Columns**:
- Filing ID (linked to detail view)
- Filer Name
- Firm Name
- Report Date
- Total Amount
- Actions (View, Export)

**Features**:
- Sortable columns
- Pagination with configurable page sizes
- Export options (CSV, PDF)
- Bulk selection for batch operations

### 4. Report Generation System

#### Pre-Built Reports
**Navigation**: Sidebar menu with report categories

**Report Categories**:
1. **Financial Analysis Reports**
   - Top Lobbyist Payments by County
   - Quarterly Spending Trends
   - Payment Method Breakdown
   - Highest Spending Employers

2. **Entity Analysis Reports**
   - Most Active Lobbying Firms
   - Employer-Lobbyist Network Analysis
   - Registration Activity Summary
   - Amendment Activity Report

3. **Geographic Reports**
   - County-by-County Spending Analysis
   - Regional Lobbying Activity
   - Municipal vs. County Lobbying

4. **Time-Series Reports**
   - Monthly Payment Trends
   - Year-over-Year Comparison
   - Seasonal Activity Patterns
   - Amendment Timeline Analysis

#### Custom Report Builder
**Interface**: Drag-and-drop report configuration

**Components**:
- **Data Source Selection**: Choose from available tables
- **Field Selector**: Drag fields to configure columns
- **Filter Panel**: Apply conditional filters
- **Grouping Options**: Group by entity, date, amount ranges
- **Visualization Selector**: Charts, graphs, tables
- **Export Settings**: Format and scheduling options

### 5. Data Visualization Components

#### Chart Types
- **Bar Charts**: Payment comparisons, entity rankings
- **Line Charts**: Trend analysis over time
- **Pie Charts**: Payment method breakdowns
- **Heat Maps**: Geographic activity intensity
- **Network Diagrams**: Employer-lobbyist relationships
- **Timeline Charts**: Amendment and filing sequences

#### Interactive Features
- Zoom and pan functionality
- Hover tooltips with detailed information
- Click-through to underlying data
- Export charts as images or PDFs

## Technical Architecture

### Current Technology Stack (Implemented)

**Frontend** (`webapp/frontend/`):
```
React 18 + TypeScript
├── Material-UI (component library)
├── React Query (data fetching)
├── React Router (navigation)
├── Chart.js (visualizations)
├── React Hook Form (form management)
├── Axios (API communication)
├── Vite (build tool)
└── TypeScript (type safety)
```

**Backend** (`webapp/backend/`):
```
Python Flask API
├── Flask (web framework)
├── Flask-CORS (cross-origin requests)
├── Flask-JWT-Extended (authentication)
├── google-cloud-bigquery (data access)
├── pandas (data processing)
└── Mock data providers (demo mode)
```

### Backend Integration Points

#### Existing Python Pipeline Integration
**File**: `/Bigquery_connection.py`
- Extend for web API authentication
- Add connection pooling for web requests

**File**: `/SQL Queries/`
- Convert existing queries to parameterized API endpoints
- Add query result caching

**File**: `/rowtypeforce.py`
- Integrate for real-time data validation
- Add API response formatting

#### Implemented API Endpoints
```python
# Search Endpoints (Implemented)
POST /api/search/entities
POST /api/search/financial
POST /api/search/filings

# Report Endpoints (Implemented)
GET /api/reports/predefined/{report_id}
POST /api/reports/custom
GET /api/reports/export/{format}

# Data Endpoints (Implemented)
GET /api/data/counties
GET /api/data/filers/autocomplete
GET /api/data/statistics/dashboard

# Authentication Endpoints (Implemented)
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET /api/auth/profile
```

### Database Query Optimization

#### Recommended BigQuery Views
```sql
-- Optimized search view
CREATE VIEW lobbying_search_optimized AS
SELECT
  filing_id,
  filer_naml,
  firm_name,
  rpt_date,
  total_amount,
  county_extracted,
  latest_amendment_flag
FROM (
  -- Your existing ROW_NUMBER() pattern
  -- with county extraction logic
);

-- Dashboard statistics view
CREATE VIEW dashboard_stats AS
SELECT
  COUNT(DISTINCT filing_id) as total_filings,
  SUM(amount) as total_payments,
  COUNT(DISTINCT filer_naml) as active_lobbyists,
  MAX(rpt_date) as latest_period
FROM lobbying_search_optimized;
```

#### Performance Considerations
- **Query Caching**: Cache common search results for 15 minutes
- **Pagination**: Implement cursor-based pagination for large results
- **Indexing**: Ensure proper indexes on frequently searched columns
- **Async Loading**: Load dashboard components independently

### Authentication & Authorization

#### User Roles and Permissions
```javascript
const USER_ROLES = {
  GUEST: {
    permissions: ['read_basic_data', 'run_simple_searches']
  },
  PUBLIC: {
    permissions: ['read_basic_data', 'run_advanced_searches', 'export_limited']
  },
  RESEARCHER: {
    permissions: ['read_all_data', 'run_custom_reports', 'export_unlimited']
  },
  JOURNALIST: {
    permissions: ['read_all_data', 'run_custom_reports', 'export_unlimited', 'bulk_downloads']
  },
  ADMIN: {
    permissions: ['full_access', 'user_management', 'system_settings']
  }
};
```

#### Session Management
- JWT tokens with 8-hour expiration
- Refresh token mechanism
- Role-based route protection
- Activity logging for audit trail

### Data Export Capabilities

#### Export Formats
- **CSV**: Raw data export with customizable columns
- **PDF**: Formatted reports with charts and branding
- **JSON**: API-friendly format for developers
- **Excel**: Formatted spreadsheets with multiple sheets

#### Export Limitations by Role
- **Guest/Public**: 1,000 rows per export, 5 exports per day
- **Researcher**: 10,000 rows per export, 20 exports per day
- **Journalist**: 50,000 rows per export, unlimited exports
- **Admin**: No limitations

## Implementation Status

### Completed Features ✅
- [x] React frontend framework with TypeScript
- [x] Python Flask API layer
- [x] User authentication system
- [x] Advanced search interface (3-tab design)
- [x] Dashboard with statistics
- [x] Results display with pagination
- [x] Mobile responsive design
- [x] Pre-built report templates
- [x] Data visualizations with Chart.js
- [x] Export capabilities (CSV, PDF, Excel)
- [x] Vercel deployment configuration
- [x] Mock data system for demonstrations

### Deployment Enhancements (2025 Best Practices)
- [x] Python 3.9 runtime specification
- [x] Optimized build process (no file copying)
- [x] Proper API routing configuration
- [x] PYTHONPATH environment variable setup
- [x] Serverless function timeout configuration
- [x] SPA routing support with rewrites
- [x] Monorepo structure with frontend/backend separation

### Integration Opportunities
- [ ] Connect to existing BigQuery ETL pipeline
- [ ] Implement real-time data updates
- [ ] Add custom report builder interface
- [ ] Performance optimization for large datasets
- [ ] Enhanced security audit
- [ ] User testing and accessibility improvements

## Security Considerations

### Data Protection
- HTTPS enforcement for all communications
- Input sanitization to prevent SQL injection
- Rate limiting to prevent abuse
- Data masking for sensitive information

### Access Control
- Role-based access control (RBAC)
- Session timeout and management
- API rate limiting per user role
- Audit logging for all data access

### Privacy Compliance
- No personal information storage beyond authentication
- Public data classification and handling
- Transparent data usage policies
- User activity anonymization in logs

## Current Deployment Architecture

### Vercel Deployment (Implemented)

The application is configured for Vercel deployment following 2025 best practices:

**vercel.json Configuration**:
```json
{
  "buildCommand": "cd webapp/frontend && npm run build",
  "outputDirectory": "webapp/frontend/build",
  "functions": {
    "webapp/backend/app.py": {
      "runtime": "python3.9",
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/webapp/backend/app.py"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "PYTHONPATH": "./webapp/backend"
  }
}
```

### Infrastructure Components
```yaml
Frontend:
  - Vercel Edge Network (global CDN)
  - Static React build served from edge
  - Automatic SSL/TLS certificates
  - Built-in performance optimization

Backend:
  - Vercel Serverless Functions (Python 3.9)
  - 30-second execution timeout
  - Auto-scaling based on demand
  - Integrated with existing BigQuery pipeline

Data Layer:
  - Google BigQuery (existing ETL pipeline)
  - Mock data support for demos
  - Connection pooling for web requests

Monitoring:
  - Vercel Analytics (built-in)
  - Vercel Functions metrics
  - Error tracking capabilities
  - Performance monitoring
```

### Environment Configuration

**Vercel Environment Variables** (set in dashboard):
```bash
# Production Environment Variables
FLASK_ENV=production
JWT_SECRET_KEY=your-secure-jwt-secret
USE_MOCK_DATA=true
GOOGLE_CLOUD_PROJECT=ca-lobby
BIGQUERY_DATASET=ca_lobby
CREDENTIALS_LOCATION=/path/to/service-account.json
PROJECT_ID=your-google-cloud-project-id
PYTHONPATH=./webapp/backend
```

**Local Development** (.env file):
```bash
# Local Environment Variables
FLASK_ENV=development
JWT_SECRET_KEY=dev-secret-key
USE_MOCK_DATA=true
BLN_API=your_big_local_news_api_key
CREDENTIALS_LOCATION=./service-account.json
PROJECT_ID=your-google-cloud-project-id
```

## Future Enhancement Opportunities

### Advanced Features
- Real-time data updates via WebSockets
- Machine learning insights and anomaly detection
- Mobile application for iOS/Android
- API for third-party developers
- Automated report scheduling and email delivery

### Integration Possibilities
- Integration with other transparency databases
- Social media sharing for reports
- Collaboration features for researchers
- Public comment system for findings
- Newsletter signup for data updates

## Current Configuration & Next Steps

### Vercel Deployment Benefits

1. **Zero-Config Deployment**: Automatic builds and deployments from Git
2. **Global Edge Network**: Fast content delivery worldwide
3. **Serverless Scaling**: Auto-scales based on traffic
4. **Built-in SSL**: Automatic HTTPS certificates
5. **Preview Deployments**: Test changes before production
6. **Environment Management**: Easy environment variable configuration

### Performance Optimizations Implemented

1. **Frontend Optimizations**:
   - Static asset caching via Vercel Edge Network
   - Code splitting with React lazy loading
   - Build optimization with Vite
   - Responsive images and compressed assets

2. **Backend Optimizations**:
   - Serverless function cold start optimization
   - 30-second timeout for complex queries
   - PYTHONPATH configured for proper imports
   - Mock data caching for demo scenarios

3. **Database Optimizations**:
   - Integration with existing BigQuery views
   - Pagination for large result sets
   - Connection pooling for API requests
   - Query result caching (when connected to BigQuery)

### Deployment Instructions

1. **Initial Deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy from project root
   vercel

   # Follow prompts to configure project
   ```

2. **Environment Variables Setup**:
   - Configure in Vercel dashboard
   - Set FLASK_ENV, JWT_SECRET_KEY, USE_MOCK_DATA
   - Add BigQuery credentials for production data

3. **Production Deployment**:
   ```bash
   vercel --prod
   ```

### Integration with Existing ETL Pipeline

The web application can leverage existing pipeline components:
- **Bigquery_connection.py**: Extended for API authentication
- **SQL Queries/**: Converted to parameterized endpoints
- **rowtypeforce.py**: Used for data validation
- **Environment variables**: Shared configuration approach

## Summary

This California lobbying transparency platform successfully combines:
- **Robust ETL Pipeline**: Existing Python-based data processing
- **Modern Web Application**: React/TypeScript frontend with Flask API
- **Production Deployment**: Vercel configuration following 2025 best practices
- **Scalable Architecture**: Serverless functions with global CDN
- **Data Integration**: Ready for BigQuery connection with mock data fallback

The platform provides a comprehensive solution for public access to California lobbying data, with advanced search capabilities, reporting tools, and data visualizations, all optimized for performance and user experience.