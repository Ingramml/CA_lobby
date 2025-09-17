
# California Lobbying Data Pipeline & Web Application

A comprehensive platform for California lobbying transparency, featuring:
- **ETL Pipeline**: Python-based data processing from Big Local News to Google BigQuery
- **Web Application**: React/Flask application for public data access and analysis
- **Vercel Deployment**: Production-ready deployment configuration

## Overview

This project streamlines the analysis of California campaign finance and lobbying data by:
- Downloading current lobbying disclosure files from [Big Local News](https://biglocalnews.org/)
- Enforcing data type consistency with existing BigQuery schemas
- Automatically uploading cleaned data to Google BigQuery for analysis

## Features

- **Automated Data Downloads**: Fetches 9 different lobbying data file types daily
- **Schema Enforcement**: Automatically aligns CSV data types with BigQuery table schemas
- **Incremental Processing**: Skips already-downloaded files to avoid duplicates
- **Error Handling**: Comprehensive error management throughout the pipeline
- **SQL Analytics**: Pre-built queries for lobbyist payment analysis

## Data Sources

The pipeline processes the following California lobbying data files:
- `cvr_lobby_disclosure_cd.csv` - Lobbying disclosure cover sheets
- `cvr_registration_cd.csv` - Registration cover sheets
- `latt_cd.csv` - Payments to lobbyist associations
- `lccm_cd.csv` - Lobbying communications
- `lemp_cd.csv` - Lobbying employment
- `lexp_cd.csv` - Lobbying expenses
- `loth_cd.csv` - Other lobbying payments
- `lpay_cd.csv` - Payments to lobbyists
- `filername_cd.csv` - Filer names

## Prerequisites

- Python 3.11+
- Google Cloud Project with BigQuery API enabled
- Big Local News API key
- Google Cloud Service Account with BigQuery permissions

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CA_lobby
```

2. Create and activate virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
Create a `.env` file with:
```
BLN_API=your_big_local_news_api_key
CREDENTIALS_LOCATION=/path/to/your/service-account.json
PROJECT_ID=your-google-cloud-project-id
```

## Usage

### Full Pipeline Execution
Run the complete ETL pipeline:
```bash
python upload_pipeline.py
```

### Individual Components

Download data only:
```python
from Bignewdownload_2 import Bignewdoanload
files = Bignewdoanload('./Downloaded_files')
```

Upload specific file:
```python
from upload import upload_to_bigquery
upload_to_bigquery(dataframe, 'table_id', credentials_path, project_id)
```

## Project Structure

```
CA_lobby/
├── Bignewdownload_2.py      # Data download from Big Local News
├── Bigquery_connection.py   # BigQuery authentication
├── upload_pipeline.py       # Main ETL orchestration
├── upload.py               # BigQuery upload functions
├── rowtypeforce.py         # Schema type enforcement
├── determine_df.py         # DataFrame/CSV utilities
├── Column_rename.py        # Column name cleanup
├── fileselector.py         # File selection utility
├── Downloaded_files/       # Data storage directory
├── SQL Queries/           # Analysis queries
├── webapp/                # Web application (deployable to Vercel)
│   ├── frontend/         # React TypeScript application
│   ├── backend/          # Python Flask API
│   ├── build.sh         # Build script
│   ├── start.sh         # Local development script
│   └── README.md        # Web app documentation
├── vercel.json           # Vercel deployment configuration
├── requirements.txt      # Python dependencies
└── .env                 # Environment variables (create this)
```

## Configuration

The pipeline uses environment variables for configuration:
- `BLN_API`: Your Big Local News API key
- `CREDENTIALS_LOCATION`: Path to Google Cloud service account JSON file
- `PROJECT_ID`: Google Cloud project ID

## Data Pipeline Flow

1. **Download**: Fetch latest data from Big Local News API
2. **Process**: Enforce data types to match BigQuery schemas
3. **Upload**: Load cleaned data into BigQuery tables
4. **Analyze**: Run SQL queries for lobbying payment analysis

## Analytics

Pre-built SQL queries are available in the `SQL Queries/` directory:
- **Payment to Lobbyist.sql**: Analyzes individual lobbyist payments
- **Payment to Lobby Associations.sql**: Tracks payments to lobbying firms

## Error Handling

The pipeline includes comprehensive error handling for:
- Network connectivity issues
- Authentication failures
- Data type conversion errors
- BigQuery API limits
- File system permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Web Application Deployment

This project includes a modern web application for accessing California lobbying data, built with React and Python Flask. The application is configured for deployment on Vercel.

### Vercel Configuration

The project uses the following Vercel configuration (vercel.json):

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

### Key Configuration Features (2025 Best Practices)

- **Python 3.9 Runtime**: Specified for backend functions with 30-second timeout
- **Optimized Build Process**: Frontend builds in webapp/frontend directory
- **API Routing**: All /api/* requests route to Python backend
- **SPA Support**: React Router compatibility with fallback to index.html
- **Environment Variables**: PYTHONPATH configured for proper module imports

### Deployment Instructions

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `FLASK_ENV=production`
   - `JWT_SECRET_KEY=your-secure-key`
   - `USE_MOCK_DATA=true` (for demo without BigQuery)

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Local Development

```bash
# Install Vercel CLI and start development server
npm i -g vercel
vercel dev

# Or run components separately:
# Frontend
cd webapp/frontend && npm start

# Backend
cd webapp/backend && python app.py
```

## License

This project is for educational and research purposes. Please respect Big Local News terms of service and Google Cloud usage policies.

## Support

For issues or questions:
1. Check existing issues in the repository
2. Review the detailed documentation in `CODEBASE_DOCUMENTATION.md`
3. For web application issues, see `webapp/README.md`
4. Create a new issue with detailed information about your problem