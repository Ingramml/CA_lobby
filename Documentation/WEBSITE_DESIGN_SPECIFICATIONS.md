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

### Frontend Technology Stack
```
React.js (v18+)
├── Material-UI or Tailwind CSS (styling)
├── React Query (data fetching)
├── React Router (navigation)
├── Chart.js or D3.js (visualizations)
├── React Hook Form (form management)
└── Axios (API communication)
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

#### New API Endpoints Required
```python
# Search Endpoints
POST /api/search/entities
POST /api/search/financial
POST /api/search/filings

# Report Endpoints
GET /api/reports/predefined/{report_id}
POST /api/reports/custom
GET /api/reports/export/{format}

# Data Endpoints
GET /api/data/counties
GET /api/data/filers/autocomplete
GET /api/data/statistics/dashboard
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

## Implementation Roadmap

### Phase 1: Core Infrastructure (4 weeks)
- [ ] Set up React frontend framework
- [ ] Create Python API layer
- [ ] Implement user authentication
- [ ] Build basic search interface

### Phase 2: Search and Display (3 weeks)
- [ ] Advanced search functionality
- [ ] Results display with pagination
- [ ] Data export capabilities
- [ ] Mobile responsive design

### Phase 3: Reporting System (4 weeks)
- [ ] Pre-built report templates
- [ ] Custom report builder
- [ ] Data visualizations
- [ ] PDF/Excel export functionality

### Phase 4: Performance and Polish (2 weeks)
- [ ] Query optimization
- [ ] Caching implementation
- [ ] Security audit
- [ ] User testing and refinement

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

## Deployment Specifications

### Infrastructure Requirements
```yaml
Frontend:
  - Static hosting (Netlify/Vercel/CloudFlare Pages)
  - CDN for global distribution
  - SSL certificate

Backend:
  - Google Cloud Run (containerized Python API)
  - Google Cloud Storage (static assets)
  - Google BigQuery (existing data)
  - Redis (caching layer)

Monitoring:
  - Google Cloud Monitoring
  - Error tracking (Sentry)
  - Analytics (Google Analytics 4)
```

### Environment Configuration
```bash
# Production Environment Variables
REACT_APP_API_URL=https://api.ca-lobby.gov
GOOGLE_CLOUD_PROJECT=ca-lobby
BIGQUERY_DATASET=ca_lobby
REDIS_URL=redis://cache.ca-lobby.internal
JWT_SECRET=your-secure-jwt-secret
RATE_LIMIT_REQUESTS_PER_MINUTE=100
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

## Questions for Implementation Planning

1. **Authentication Provider**: Should we use Google OAuth, custom authentication, or integrate with existing government systems?

2. **Data Refresh Frequency**: How often should the website sync with your BigQuery pipeline? Real-time, hourly, daily?

3. **Public Access Level**: What data should be freely accessible vs. requiring registration/authentication?

4. **Mobile Priority**: Is mobile access critical for your target users (journalists, researchers)?

5. **Branding Requirements**: Any specific California state branding guidelines or accessibility requirements?

6. **Performance SLA**: Expected response times and concurrent user capacity?

7. **Budget Constraints**: Any limitations on cloud infrastructure costs?

8. **Launch Timeline**: Target launch date and any interim milestone requirements?

This comprehensive design provides a solid foundation for building a professional, accessible, and powerful California lobbying transparency platform that leverages your existing BigQuery data pipeline while providing intuitive public access to this important civic information.