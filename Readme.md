
# California Lobbying Data Pipeline

A Python-based ETL pipeline that automates the download, processing, and upload of California lobbying disclosure data from Big Local News to Google BigQuery.

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
├── requirements.txt       # Python dependencies
└── .env                  # Environment variables (create this)
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

## License

This project is for educational and research purposes. Please respect Big Local News terms of service and Google Cloud usage policies.

## Support

For issues or questions:
1. Check existing issues in the repository
2. Review the detailed documentation in `CODEBASE_DOCUMENTATION.md`
3. Create a new issue with detailed information about your problem