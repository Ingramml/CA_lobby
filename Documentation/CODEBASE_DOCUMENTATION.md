# CA Lobby Data Pipeline - Codebase Documentation

## Overview

This codebase implements an automated data pipeline for downloading, processing, and uploading California lobbying data from Big Local News to Google BigQuery. The system handles data extraction, type enforcement, schema alignment, and bulk uploads of campaign finance and lobbying disclosure data.

## Project Structure

```
CA_lobby/
├── __pycache__/                    # Python cache files
├── .venv/                          # Virtual environment
├── Downloaded_files/               # Data download directory
│   ├── 2025-06-17/                # Date-organized downloads
│   ├── 2025-07-03/
│   └── 2025-09-16/
├── SQL Queries/                    # Analysis queries
│   ├── Payment to Lobbyist.sql
│   └── Payyment to Lobby Associations.sql
├── Python Files (detailed below)
├── .env                           # Environment variables (excluded)
├── .gitignore                     # Git ignore rules
├── Readme.md                      # Basic project description
├── requirements.txt               # Python dependencies
└── bln-python-client-readthedocs-io-en-latest.pdf  # Documentation
```

## Core Python Files

### 1. Bignewdownload_2.py
**Purpose**: Downloads California lobbying data from Big Local News API

**Key Functions**:
- `Bignewdoanload(output_dir)`: Main download function
  - Creates date-organized directories
  - Downloads multiple CSV files from BLN project
  - Skips existing files to avoid duplicates
  - Returns list of downloaded files

**Data Files Downloaded**:
- `cvr_lobby_disclosure_cd.csv` - Lobbying disclosure cover sheets
- `cvr_registration_cd.csv` - Registration cover sheets
- `latt_cd.csv` - Payments to lobbyist associations
- `lccm_cd.csv` - Lobbying communications
- `lemp_cd.csv` - Lobbying employment
- `lexp_cd.csv` - Lobbying expenses
- `loth_cd.csv` - Other lobbying payments
- `lpay_cd.csv` - Payments to lobbyists
- `filername_cd.csv` - Filer names

**Dependencies**: bln, pandas, dotenv, os, datetime, ssl, certifi

### 2. Bigquery_connection.py
**Purpose**: Manages Google BigQuery connections and authentication

**Key Functions**:
- `bigquery_connect(credentials_path)`: Establishes BigQuery client connection
- `get_project_id_from_credentials(credentials_path)`: Extracts project ID from service account

**Features**:
- Service account authentication
- Connection testing via dataset listing
- Error handling for authentication failures
- Project ID extraction from credentials

**Dependencies**: google.cloud.bigquery, google.oauth2.service_account, dotenv

### 3. upload_pipeline.py
**Purpose**: Main orchestration script that coordinates the entire ETL process

**Workflow**:
1. Downloads data using `Bignewdoanload()`
2. Processes each CSV file through type enforcement
3. Uploads cleaned data to BigQuery tables
4. Handles table naming conventions

**Key Features**:
- Date-based file organization
- Automatic table name extraction from filenames
- Skip files starting with "clean" or "project"
- BigQuery client connection management

**Dependencies**: All other modules in the project

### 4. upload.py
**Purpose**: Handles BigQuery table uploads from pandas DataFrames

**Key Functions**:
- `upload_to_bigquery(inputfile, table_id, credentials_path, project_id)`:
  - Accepts DataFrame or CSV file path
  - Loads data into specified BigQuery table
  - Provides comprehensive error handling

**Features**:
- DataFrame/CSV file input flexibility
- Google API error handling
- Job completion waiting
- Success/failure reporting

**Dependencies**: google.cloud.bigquery, pandas, determine_df module

### 5. rowtypeforce.py
**Purpose**: Enforces data type alignment between CSV data and BigQuery schema

**Key Functions**:
- `row_type_force(client, tablename, inputfile)`:
  - Retrieves BigQuery table schema
  - Maps and converts pandas DataFrame types to match BigQuery types
  - Handles multiple data types (STRING, INTEGER, FLOAT, BOOLEAN, TIMESTAMP, DATE, DATETIME, TIME, BYTES)
  - Saves cleaned CSV files with "cleaned_" prefix

**Type Conversions**:
- STRING → pandas str
- INTEGER → pandas Int64 (nullable)
- FLOAT → pandas float64
- BOOLEAN → pandas bool
- TIMESTAMP/DATETIME → pandas datetime
- DATE → pandas date
- TIME → pandas time
- BYTES → encoded bytes

**Dependencies**: pandas, bigquery client, determine_df module

### 6. determine_df.py
**Purpose**: Utility module for flexible DataFrame/CSV handling

**Key Functions**:
- `ensure_dataframe(input_data)`:
  - Accepts pandas DataFrame or CSV file path
  - Returns consistent pandas DataFrame output
  - Validates file existence and format
  - Uses `low_memory=False` for robust CSV reading

**Features**:
- Type checking for DataFrame vs file path
- File validation and error handling
- Consistent DataFrame output interface

### 7. Column_rename.py
**Purpose**: BigQuery table column name cleanup utility

**Functionality**:
- Connects to existing BigQuery tables
- Removes " text" suffixes from column names
- Creates new tables with cleaned schema
- Uses CREATE OR REPLACE TABLE with column mapping

**Target Tables**: Processes `latt_cd_copy` → `latt_cd`

### 8. fileselector.py
**Purpose**: Simple file discovery utility for processing queue

**Functionality**:
- Scans Downloaded_files directory for CSV files
- Filters out processed files (starting with "clean" or "project")
- Displays available files for processing selection

## Configuration Files

### requirements.txt
**Key Dependencies**:
- **bln==2.3.10**: Big Local News API client
- **google-cloud-bigquery==3.32.0**: BigQuery Python client
- **pandas==2.2.3**: Data manipulation and analysis
- **python-dotenv==1.0.1**: Environment variable management
- **google-auth==2.40.1**: Google Cloud authentication
- **dask==2025.2.0**: Parallel computing (likely for large datasets)

### .env (Not accessible)
**Expected Variables**:
- `BLN_API`: Big Local News API key
- `CREDENTIALS_LOCATION`: Path to Google Cloud service account JSON
- `PROJECT_ID`: Google Cloud project identifier

### .gitignore
**Exclusions**:
- Environment files (*.env)
- Python cache (__pycache__/)
- Virtual environment (.venv)
- Data files (*.csv, /Download*, /Agenda*)
- Various temporary and output files

## SQL Analysis Queries

### Payment to Lobbyist.sql
**Purpose**: Analyzes payments made to individual lobbyists

**Key Features**:
- Joins lobbying disclosure covers with payment details
- Filters for county-specific data using pattern matching
- Implements amendment handling with row numbering
- Deduplicates to get latest amendment versions
- Focuses on most recent reporting periods

**Tables Used**:
- `cvr_lobby_disclosure_cd` (cover sheets)
- `lpay_cd` (lobbyist payments)
- `county_City` (county filtering)

### Payyment to Lobby Associations.sql
**Purpose**: Tracks payments to lobbying associations/firms

**Key Features**:
- Joins disclosure data with association payment records
- County-based filtering similar to individual payments
- Amendment versioning with row ranking
- Non-null amount filtering

**Tables Used**:
- `cvr_lobby_disclosure_cd` (cover sheets)
- `latt_cd` (association payments)
- `county_City` (county filtering)

## Data Flow Architecture

```
Big Local News API
        ↓
   Bignewdownload_2.py (Download CSVs)
        ↓
   Files saved to Downloaded_files/{date}/
        ↓
   upload_pipeline.py (Orchestration)
        ↓
   rowtypeforce.py (Schema alignment)
        ↓
   upload.py (BigQuery upload)
        ↓
   Google BigQuery Tables
```

## Key Features

### Data Pipeline Automation
- **Scheduled Downloads**: Date-based organization prevents duplicate downloads
- **Schema Enforcement**: Automatic type conversion to match BigQuery schemas
- **Error Handling**: Comprehensive error management at each pipeline stage
- **File Management**: Organized storage with cleaned file prefixes

### BigQuery Integration
- **Authentication**: Service account-based authentication
- **Schema Matching**: Dynamic type enforcement based on existing table schemas
- **Bulk Loading**: Efficient DataFrame-to-BigQuery uploads
- **Table Management**: Automated table naming from file conventions

### Data Processing
- **Multiple File Types**: Handles 9 different lobbying data file types
- **Amendment Handling**: SQL queries manage document amendments and versions
- **Geographic Filtering**: County-based data filtering in analysis queries
- **Data Quality**: Type coercion with error handling for malformed data

## Usage Patterns

### Full Pipeline Execution
```python
# Run the complete ETL pipeline
python upload_pipeline.py
```

### Individual Component Usage
```python
# Download only
from Bignewdownload_2 import Bignewdoanload
files = Bignewdoanload('./Downloaded_files')

# Upload only
from upload import upload_to_bigquery
upload_to_bigquery(dataframe, 'table_id', credentials, project)
```

## Dependencies and Environment
- **Python 3.11+**: Based on __pycache__ structure
- **Google Cloud Project**: Requires BigQuery API enabled
- **Big Local News Account**: Requires API key for data access
- **Service Account**: JSON credentials file for BigQuery access

## Security Considerations
- API keys stored in environment variables
- Service account credentials external to repository
- .env file properly excluded from version control
- Error messages avoid exposing sensitive information

This codebase represents a robust, production-ready data pipeline for California lobbying data analysis with proper error handling, schema management, and automated processing capabilities.