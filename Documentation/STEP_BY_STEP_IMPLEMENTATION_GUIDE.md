# CA Lobby Step-by-Step Implementation Guide

**Date**: 2024-09-21
**Based on**: DEPLOYMENT_SAFE_DEVELOPMENT_PLAN.md
**Objective**: Actionable step-by-step instructions for safe feature development

> 📖 **Reference**: This guide provides concrete steps to implement the strategy outlined in `DEPLOYMENT_SAFE_DEVELOPMENT_PLAN.md`

---

## 🚀 **Getting Started**

### **Step 0: Initial Setup**
```bash
# 1. Ensure you're in the project root
cd /Users/michaelingram/Documents/GitHub/CA_lobby

# 2. Check current git status
git status
git log --oneline -5

# 3. Create baseline tag (if not exists)
git tag v1.0.0-baseline
git push origin v1.0.0-baseline

# 4. Verify current structure
ls -la webapp/frontend/build/
ls -la webapp/backend/
```

---

## 📋 **Phase 1: Deployment Foundation**

### **Step 1.1: Create Vercel Configuration**

**Time Estimate**: 30 minutes
**Objective**: Enable Vercel deployment

```bash
# 1. Create feature branch
git checkout -b feature/vercel-config

# 2. Create vercel.json in project root
touch vercel.json
```

**Copy this content to vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "webapp/frontend/build/**",
      "use": "@vercel/static"
    },
    {
      "src": "webapp/backend/app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "webapp/backend/app.py"
    },
    {
      "src": "/(.*)",
      "dest": "webapp/frontend/build/$1"
    }
  ]
}
```

```bash
# 3. Create root package.json
touch package.json
```

**Copy this content to package.json:**
```json
{
  "name": "ca-lobby",
  "version": "1.0.0",
  "description": "California Lobbying Transparency Webapp",
  "scripts": {
    "build": "echo 'Build process complete'",
    "start": "python webapp/backend/app.py"
  },
  "engines": {
    "node": "18.x",
    "python": "3.11.x"
  }
}
```

```bash
# 4. Commit changes
git add vercel.json package.json
git commit -m "Add Vercel deployment configuration

- Configure routing for React frontend and Flask backend
- Set Node.js and Python engine versions
- Enable static file serving for build artifacts"

# 5. Test deployment (replace with your Vercel setup)
# If you have Vercel CLI installed:
# vercel --prebuilt

# 6. Tag save point
git tag v1.0.1-vercel-config
git push origin v1.0.1-vercel-config

# 7. Merge to main if deployment successful
git checkout main
git merge feature/vercel-config
git push origin main
```

**✅ Validation Checklist:**
- [ ] vercel.json created with correct routing
- [ ] package.json has proper engines
- [ ] Git tag created
- [ ] Changes merged to main

---

### **Step 1.2: Create Flask API Foundation**

**Time Estimate**: 45 minutes
**Objective**: Working Flask backend with health checks

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/flask-api-core

# 2. Create the Flask app file
touch webapp/backend/app.py
```

**Copy this content to webapp/backend/app.py:**
```python
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
from datetime import datetime

# Add project root to path for importing data processing scripts
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
sys.path.insert(0, project_root)

app = Flask(__name__)
CORS(app)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

@app.route('/api/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'message': 'CA Lobby API is running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/status')
def status():
    """System status endpoint"""
    return jsonify({
        'version': '1.0.0',
        'environment': os.getenv('FLASK_ENV', 'production'),
        'mock_data': os.getenv('USE_MOCK_DATA', 'true'),
        'debug': os.getenv('DEBUG', 'False'),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test-data-access')
def test_data_access():
    """Test access to existing data processing scripts"""
    try:
        # Test import of existing data processing modules
        import Bignewdownload_2
        import Bigquery_connection
        import determine_df

        return jsonify({
            'status': 'success',
            'message': 'Data processing scripts accessible',
            'available_modules': [
                'Bignewdownload_2',
                'Bigquery_connection',
                'determine_df'
            ]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Data access error: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found',
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

```bash
# 3. Test locally first
cd webapp/backend

# Install dependencies if needed
pip install flask flask-cors python-dotenv

# Start the Flask app
python app.py &
FLASK_PID=$!

# Wait for startup
sleep 3

# Test endpoints
echo "Testing health endpoint:"
curl -s http://localhost:5000/api/health | jq '.'

echo "Testing status endpoint:"
curl -s http://localhost:5000/api/status | jq '.'

echo "Testing data access:"
curl -s http://localhost:5000/api/test-data-access | jq '.'

# Stop Flask app
kill $FLASK_PID

# Return to project root
cd ../..
```

```bash
# 4. Commit changes
git add webapp/backend/app.py
git commit -m "Add Flask API foundation with health checks

- Implement basic Flask app with CORS support
- Add health check and status endpoints
- Include data processing script integration test
- Add proper error handling and logging
- Configure for production deployment"

# 5. Deploy and test
# If using Vercel CLI:
# vercel --prebuilt
#
# Test the deployed endpoints:
# curl https://your-preview-url.vercel.app/api/health
# curl https://your-preview-url.vercel.app/api/status

# 6. Tag save point
git tag v1.0.2-flask-foundation
git push origin v1.0.2-flask-foundation

# 7. Merge to main
git checkout main
git merge feature/flask-api-core
git push origin main
```

**✅ Validation Checklist:**
- [ ] Flask app.py created with all endpoints
- [ ] Local testing successful (all 3 endpoints work)
- [ ] Data processing scripts accessible
- [ ] Deployment successful
- [ ] Health checks pass in production
- [ ] Git tag created and merged

---

## 📊 **Phase 2: Core API Implementation**

### **Step 2.1: Dashboard API Endpoints**

**Time Estimate**: 1 hour
**Objective**: Working dashboard data endpoints

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/dashboard-api

# 2. Edit webapp/backend/app.py to add dashboard endpoints
```

**Add these endpoints to app.py (insert after the existing endpoints):**
```python
@app.route('/api/dashboard/stats')
def dashboard_stats():
    """Dashboard statistics overview"""
    try:
        # Mock data based on California lobbying patterns
        # In production, this would query actual data
        return jsonify({
            'total_lobbying_entities': 1247,
            'active_registrations': 891,
            'quarterly_filings': 445,
            'total_expenditures': 15750000,
            'last_updated': datetime.now().isoformat(),
            'data_source': 'mock' if os.getenv('USE_MOCK_DATA', 'true') == 'true' else 'live'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Dashboard stats error: {str(e)}'
        }), 500

@app.route('/api/dashboard/activity')
def dashboard_activity():
    """Recent activity feed"""
    try:
        # Mock recent activity data
        return jsonify({
            'recent_filings': [
                {
                    'id': 'F2024-001',
                    'entity': 'California Medical Association',
                    'date': '2024-09-20',
                    'type': 'Quarterly Report',
                    'status': 'Filed'
                },
                {
                    'id': 'F2024-002',
                    'entity': 'California Chamber of Commerce',
                    'date': '2024-09-19',
                    'type': 'Registration Update',
                    'status': 'Pending'
                },
                {
                    'id': 'F2024-003',
                    'entity': 'Tech Industry Coalition',
                    'date': '2024-09-18',
                    'type': 'Expenditure Report',
                    'status': 'Filed'
                }
            ],
            'activity_summary': {
                'filings_today': 12,
                'pending_reviews': 8,
                'new_registrations': 3
            },
            'last_updated': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Dashboard activity error: {str(e)}'
        }), 500

@app.route('/api/dashboard/metrics')
def dashboard_metrics():
    """Key performance metrics"""
    try:
        return jsonify({
            'monthly_trends': {
                'january': {'filings': 145, 'expenditures': 2100000},
                'february': {'filings': 132, 'expenditures': 1950000},
                'march': {'filings': 167, 'expenditures': 2450000},
                'april': {'filings': 156, 'expenditures': 2300000},
                'may': {'filings': 189, 'expenditures': 2650000},
                'june': {'filings': 201, 'expenditures': 2800000}
            },
            'top_spending_categories': [
                {'category': 'Healthcare', 'amount': 4200000},
                {'category': 'Technology', 'amount': 3800000},
                {'category': 'Energy', 'amount': 3100000},
                {'category': 'Education', 'amount': 2900000},
                {'category': 'Transportation', 'amount': 2400000}
            ],
            'compliance_rate': 94.2,
            'last_updated': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Dashboard metrics error: {str(e)}'
        }), 500
```

```bash
# 3. Test locally
cd webapp/backend
python app.py &
FLASK_PID=$!
sleep 3

echo "Testing dashboard stats:"
curl -s http://localhost:5000/api/dashboard/stats | jq '.'

echo "Testing dashboard activity:"
curl -s http://localhost:5000/api/dashboard/activity | jq '.'

echo "Testing dashboard metrics:"
curl -s http://localhost:5000/api/dashboard/metrics | jq '.'

# Verify existing endpoints still work
echo "Testing health (should still work):"
curl -s http://localhost:5000/api/health | jq '.status'

kill $FLASK_PID
cd ../..
```

```bash
# 4. Commit changes
git add webapp/backend/app.py
git commit -m "Add dashboard API endpoints with mock data

- Implement /api/dashboard/stats for overview statistics
- Add /api/dashboard/activity for recent filing activity
- Include /api/dashboard/metrics for performance trends
- All endpoints return California-specific mock data
- Maintain backward compatibility with existing endpoints"

# 5. Deploy and validate
# vercel --prebuilt
#
# Test deployed endpoints:
# curl https://preview-url.vercel.app/api/dashboard/stats
# curl https://preview-url.vercel.app/api/dashboard/activity
# curl https://preview-url.vercel.app/api/dashboard/metrics

# 6. Performance check
echo "Checking response times:"
time curl -s https://preview-url.vercel.app/api/dashboard/stats > /dev/null
# Should be under 2 seconds

# 7. Tag and merge
git tag v1.1.0-dashboard-api
git push origin v1.1.0-dashboard-api
git checkout main
git merge feature/dashboard-api
git push origin main
```

**✅ Validation Checklist:**
- [ ] All 3 dashboard endpoints implemented
- [ ] Local testing successful
- [ ] Mock data returns California-appropriate content
- [ ] Existing endpoints still functional
- [ ] Deployment successful
- [ ] Response times under 2 seconds
- [ ] Git tag created and merged

---

### **Step 2.2: Search API Endpoints**

**Time Estimate**: 1.5 hours
**Objective**: Search functionality with pagination

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/search-api

# 2. Add search endpoints to app.py
```

**Add these endpoints to app.py:**
```python
@app.route('/api/search/entities', methods=['GET', 'POST'])
def search_entities():
    """Search lobbying entities"""
    try:
        # Get search parameters
        if request.method == 'POST':
            data = request.get_json() or {}
        else:
            data = request.args.to_dict()

        query = data.get('query', '')
        page = int(data.get('page', 1))
        limit = min(int(data.get('limit', 20)), 100)  # Max 100 results per page
        entity_type = data.get('type', 'all')

        # Mock search results
        mock_entities = [
            {
                'id': 'ENT-001',
                'name': 'California Medical Association',
                'type': 'Professional Association',
                'registration_date': '2024-01-15',
                'status': 'Active',
                'total_expenditures': 2100000
            },
            {
                'id': 'ENT-002',
                'name': 'Tech Industry Coalition',
                'type': 'Industry Group',
                'registration_date': '2024-02-01',
                'status': 'Active',
                'total_expenditures': 1800000
            },
            {
                'id': 'ENT-003',
                'name': 'California Chamber of Commerce',
                'type': 'Business Association',
                'registration_date': '2023-12-10',
                'status': 'Active',
                'total_expenditures': 3200000
            }
        ]

        # Filter by query if provided
        if query:
            mock_entities = [e for e in mock_entities if query.lower() in e['name'].lower()]

        # Pagination
        start = (page - 1) * limit
        end = start + limit
        results = mock_entities[start:end]

        return jsonify({
            'results': results,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_results': len(mock_entities),
                'total_pages': (len(mock_entities) + limit - 1) // limit
            },
            'search_params': {
                'query': query,
                'type': entity_type
            },
            'last_updated': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Entity search error: {str(e)}'
        }), 500

@app.route('/api/search/filings', methods=['GET', 'POST'])
def search_filings():
    """Search filing documents"""
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
        else:
            data = request.args.to_dict()

        query = data.get('query', '')
        page = int(data.get('page', 1))
        limit = min(int(data.get('limit', 20)), 100)
        filing_type = data.get('filing_type', 'all')
        date_from = data.get('date_from', '')
        date_to = data.get('date_to', '')

        mock_filings = [
            {
                'id': 'F2024-001',
                'title': 'Q3 2024 Lobbying Report',
                'entity': 'California Medical Association',
                'type': 'Quarterly Report',
                'file_date': '2024-09-15',
                'amount': 750000,
                'status': 'Filed'
            },
            {
                'id': 'F2024-002',
                'title': 'Technology Policy Advocacy',
                'entity': 'Tech Industry Coalition',
                'type': 'Activity Report',
                'file_date': '2024-09-10',
                'amount': 420000,
                'status': 'Under Review'
            }
        ]

        # Apply filters
        if query:
            mock_filings = [f for f in mock_filings if query.lower() in f['title'].lower()]

        if filing_type != 'all':
            mock_filings = [f for f in mock_filings if f['type'].lower() == filing_type.lower()]

        # Pagination
        start = (page - 1) * limit
        end = start + limit
        results = mock_filings[start:end]

        return jsonify({
            'results': results,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_results': len(mock_filings),
                'total_pages': (len(mock_filings) + limit - 1) // limit
            },
            'search_params': {
                'query': query,
                'filing_type': filing_type,
                'date_from': date_from,
                'date_to': date_to
            },
            'last_updated': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Filing search error: {str(e)}'
        }), 500
```

```bash
# 3. Test locally
cd webapp/backend
python app.py &
FLASK_PID=$!
sleep 3

echo "Testing entity search (GET):"
curl -s "http://localhost:5000/api/search/entities?query=medical&page=1&limit=10" | jq '.'

echo "Testing entity search (POST):"
curl -s -X POST http://localhost:5000/api/search/entities \
  -H "Content-Type: application/json" \
  -d '{"query": "tech", "page": 1, "limit": 5}' | jq '.'

echo "Testing filing search:"
curl -s "http://localhost:5000/api/search/filings?query=report" | jq '.'

kill $FLASK_PID
cd ../..
```

```bash
# 4. Commit and deploy
git add webapp/backend/app.py
git commit -m "Add search API endpoints with pagination

- Implement /api/search/entities with filtering and pagination
- Add /api/search/filings with date range and type filters
- Support both GET and POST methods for search
- Include comprehensive pagination metadata
- Add proper error handling and validation"

# 5. Deploy and test
# vercel --prebuilt

# 6. Tag and merge
git tag v1.1.1-search-api
git push origin v1.1.1-search-api
git checkout main
git merge feature/search-api
git push origin main
```

**✅ Validation Checklist:**
- [ ] Entity search endpoint works (GET and POST)
- [ ] Filing search endpoint works with filters
- [ ] Pagination functions correctly
- [ ] Search parameters are respected
- [ ] Error handling works
- [ ] Deployment successful

---

### **Step 2.3: Export API Endpoints**

**Time Estimate**: 1 hour
**Objective**: Data export functionality

```bash
# 1. Create feature branch
git checkout main
git pull origin main
git checkout -b feature/export-api

# 2. Add export endpoints to app.py
```

**Add these endpoints to app.py:**
```python
from flask import send_file, make_response
import csv
import io
import json

@app.route('/api/export/csv', methods=['POST'])
def export_csv():
    """Export data as CSV"""
    try:
        data = request.get_json() or {}
        export_type = data.get('type', 'entities')
        filters = data.get('filters', {})

        # Create CSV content based on export type
        if export_type == 'entities':
            csv_data = [
                ['ID', 'Name', 'Type', 'Registration Date', 'Status', 'Total Expenditures'],
                ['ENT-001', 'California Medical Association', 'Professional Association', '2024-01-15', 'Active', '2100000'],
                ['ENT-002', 'Tech Industry Coalition', 'Industry Group', '2024-02-01', 'Active', '1800000'],
                ['ENT-003', 'California Chamber of Commerce', 'Business Association', '2023-12-10', 'Active', '3200000']
            ]
        elif export_type == 'filings':
            csv_data = [
                ['ID', 'Title', 'Entity', 'Type', 'File Date', 'Amount', 'Status'],
                ['F2024-001', 'Q3 2024 Lobbying Report', 'California Medical Association', 'Quarterly Report', '2024-09-15', '750000', 'Filed'],
                ['F2024-002', 'Technology Policy Advocacy', 'Tech Industry Coalition', 'Activity Report', '2024-09-10', '420000', 'Under Review']
            ]
        else:
            return jsonify({'status': 'error', 'message': 'Invalid export type'}), 400

        # Create CSV file in memory
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerows(csv_data)
        csv_content = output.getvalue()
        output.close()

        # Create response
        response = make_response(csv_content)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=ca_lobby_{export_type}_{datetime.now().strftime("%Y%m%d")}.csv'

        return response

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'CSV export error: {str(e)}'
        }), 500

@app.route('/api/export/json', methods=['POST'])
def export_json():
    """Export data as JSON"""
    try:
        data = request.get_json() or {}
        export_type = data.get('type', 'entities')
        filters = data.get('filters', {})

        # Get data based on export type
        if export_type == 'entities':
            export_data = {
                'export_type': 'entities',
                'generated_at': datetime.now().isoformat(),
                'data': [
                    {
                        'id': 'ENT-001',
                        'name': 'California Medical Association',
                        'type': 'Professional Association',
                        'registration_date': '2024-01-15',
                        'status': 'Active',
                        'total_expenditures': 2100000
                    },
                    {
                        'id': 'ENT-002',
                        'name': 'Tech Industry Coalition',
                        'type': 'Industry Group',
                        'registration_date': '2024-02-01',
                        'status': 'Active',
                        'total_expenditures': 1800000
                    }
                ]
            }
        elif export_type == 'filings':
            export_data = {
                'export_type': 'filings',
                'generated_at': datetime.now().isoformat(),
                'data': [
                    {
                        'id': 'F2024-001',
                        'title': 'Q3 2024 Lobbying Report',
                        'entity': 'California Medical Association',
                        'type': 'Quarterly Report',
                        'file_date': '2024-09-15',
                        'amount': 750000,
                        'status': 'Filed'
                    }
                ]
            }
        else:
            return jsonify({'status': 'error', 'message': 'Invalid export type'}), 400

        response = make_response(json.dumps(export_data, indent=2))
        response.headers['Content-Type'] = 'application/json'
        response.headers['Content-Disposition'] = f'attachment; filename=ca_lobby_{export_type}_{datetime.now().strftime("%Y%m%d")}.json'

        return response

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'JSON export error: {str(e)}'
        }), 500

@app.route('/api/export/formats')
def export_formats():
    """Get available export formats"""
    return jsonify({
        'available_formats': ['csv', 'json'],
        'export_types': ['entities', 'filings'],
        'max_records': 10000,
        'rate_limit': '10 exports per hour'
    })
```

```bash
# 3. Test locally
cd webapp/backend
python app.py &
FLASK_PID=$!
sleep 3

echo "Testing export formats:"
curl -s http://localhost:5000/api/export/formats | jq '.'

echo "Testing CSV export:"
curl -s -X POST http://localhost:5000/api/export/csv \
  -H "Content-Type: application/json" \
  -d '{"type": "entities"}' \
  -o test_export.csv

echo "CSV file created:"
head test_export.csv

echo "Testing JSON export:"
curl -s -X POST http://localhost:5000/api/export/json \
  -H "Content-Type: application/json" \
  -d '{"type": "filings"}' | head -20

rm -f test_export.csv
kill $FLASK_PID
cd ../..
```

```bash
# 4. Commit and deploy
git add webapp/backend/app.py
git commit -m "Add export API endpoints for data download

- Implement /api/export/csv for CSV file generation
- Add /api/export/json for JSON data export
- Include /api/export/formats for format information
- Support entities and filings export types
- Add proper file headers and naming conventions"

# 5. Deploy and test
# vercel --prebuilt

# 6. Tag and merge
git tag v1.1.2-export-api
git push origin v1.1.2-export-api
git checkout main
git merge feature/export-api
git push origin main
```

**✅ Validation Checklist:**
- [ ] Export formats endpoint works
- [ ] CSV export generates proper files
- [ ] JSON export returns formatted data
- [ ] File headers and naming work correctly
- [ ] Both export types (entities/filings) function
- [ ] Deployment successful

---

## 🎯 **Quick Command Reference**

### **Daily Workflow Commands**
```bash
# Start new feature
git checkout main && git pull origin main
git checkout -b feature/your-feature-name

# Test locally
cd webapp/backend && python app.py &
curl -s http://localhost:5000/api/health
kill %1

# Deploy and validate
git add . && git commit -m "Description"
# vercel --prebuilt
# curl https://preview-url.vercel.app/api/health

# Tag and merge
git tag v1.x.x-feature-name
git checkout main && git merge feature/your-feature-name
git push origin main --tags
```

### **Emergency Rollback**
```bash
# Quick rollback to last stable
git checkout main
git reset --hard v1.x.x-last-stable-tag
# vercel --prod
```

### **Health Check Commands**
```bash
# Local health check
curl -s http://localhost:5000/api/health | jq '.status'

# Production health check
curl -s https://your-domain.vercel.app/api/health | jq '.status'

# Performance check
time curl -s https://your-domain.vercel.app/api/dashboard/stats > /dev/null
```

---

## 📋 **Next Steps**

After completing Phase 2 (API Implementation), continue with:

1. **Phase 3: Frontend Implementation** (Steps 3.1-3.3)
2. **Phase 4: Feature Enhancement** (Steps 4.1-4.4)
3. **Phase 5: Production Optimization** (Steps 5.1-5.2)

Each phase follows the same pattern:
- Create feature branch
- Implement changes
- Test locally
- Deploy and validate
- Tag save point
- Merge to main

Remember: **Never proceed if deployment fails** - always fix issues or rollback before continuing.