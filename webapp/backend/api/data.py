"""
Data API endpoints
Provides autocomplete, lookup data, and reference information
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
import json

bp = Blueprint('data', __name__)

# Mock data for development - In production, this would come from BigQuery
MOCK_COUNTIES = [
    {'label': 'Alameda County', 'value': 'alameda', 'count': 145},
    {'label': 'Los Angeles County', 'value': 'los_angeles', 'count': 892},
    {'label': 'Orange County', 'value': 'orange', 'count': 234},
    {'label': 'Sacramento County', 'value': 'sacramento', 'count': 567},
    {'label': 'San Diego County', 'value': 'san_diego', 'count': 321},
    {'label': 'San Francisco County', 'value': 'san_francisco', 'count': 445},
    {'label': 'Santa Clara County', 'value': 'santa_clara', 'count': 198},
    {'label': 'Riverside County', 'value': 'riverside', 'count': 87},
    {'label': 'San Bernardino County', 'value': 'san_bernardino', 'count': 76},
    {'label': 'Fresno County', 'value': 'fresno', 'count': 54},
]

MOCK_CITIES = {
    'sacramento': [
        {'label': 'Sacramento', 'value': 'sacramento', 'count': 445},
        {'label': 'Elk Grove', 'value': 'elk_grove', 'count': 32},
        {'label': 'Folsom', 'value': 'folsom', 'count': 18},
        {'label': 'Citrus Heights', 'value': 'citrus_heights', 'count': 12},
    ],
    'los_angeles': [
        {'label': 'Los Angeles', 'value': 'los_angeles', 'count': 692},
        {'label': 'Long Beach', 'value': 'long_beach', 'count': 87},
        {'label': 'Glendale', 'value': 'glendale', 'count': 45},
        {'label': 'Pasadena', 'value': 'pasadena', 'count': 68},
    ],
    'san_francisco': [
        {'label': 'San Francisco', 'value': 'san_francisco', 'count': 445},
    ],
}

MOCK_FILING_PERIODS = [
    {'label': '2024 Q3 (Jul-Sep)', 'value': '2024-Q3'},
    {'label': '2024 Q2 (Apr-Jun)', 'value': '2024-Q2'},
    {'label': '2024 Q1 (Jan-Mar)', 'value': '2024-Q1'},
    {'label': '2023 Q4 (Oct-Dec)', 'value': '2023-Q4'},
    {'label': '2023 Q3 (Jul-Sep)', 'value': '2023-Q3'},
    {'label': '2023 Q2 (Apr-Jun)', 'value': '2023-Q2'},
]

def get_autocomplete_from_bigquery(field, query, limit):
    """Get autocomplete suggestions from BigQuery"""
    if not current_app.bigquery_client:
        return []

    try:
        field_mapping = {
            'filers': 'filer_naml',
            'firms': 'firm_name',
            'employers': 'emplr_naml',
            'counties': 'county_name',
            'cities': 'city_name'
        }

        table_mapping = {
            'filers': 'ca-lobby.ca_lobby.cvr_lobby_disclosure_cd',
            'firms': 'ca-lobby.ca_lobby.cvr_lobby_disclosure_cd',
            'employers': 'ca-lobby.ca_lobby.lpay_cd',
            'counties': 'ca-lobby.ca_lobby.county_city',
            'cities': 'ca-lobby.ca_lobby.county_city'
        }

        if field not in field_mapping:
            return []

        column = field_mapping[field]
        table = table_mapping[field]

        sql_query = f"""
        SELECT
            {column} as label,
            LOWER(REPLACE({column}, ' ', '_')) as value,
            COUNT(*) as count
        FROM `{table}`
        WHERE UPPER({column}) LIKE UPPER('%{query}%')
        AND {column} IS NOT NULL
        AND {column} != ''
        GROUP BY {column}
        ORDER BY count DESC, {column}
        LIMIT {limit}
        """

        result_df = current_app.bigquery_client.query(sql_query).to_dataframe()

        suggestions = []
        for _, row in result_df.iterrows():
            suggestions.append({
                'label': str(row['label']),
                'value': str(row['value']),
                'count': int(row['count'])
            })

        return suggestions

    except Exception as e:
        current_app.logger.error(f"BigQuery autocomplete error: {str(e)}")
        return []

@bp.route('/counties', methods=['GET'])
def get_counties():
    """Get list of California counties with lobbying activity"""
    try:
        if current_app.bigquery_client:
            # Try to get from BigQuery
            counties_query = """
            SELECT
                county,
                COUNT(DISTINCT filing_id) as count
            FROM (
                SELECT
                    filing_id,
                    REGEXP_EXTRACT(UPPER(filer_naml), r'(\\b[A-Z\\s]+\\sCOUNTY\\b)') as county
                FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
                WHERE REGEXP_CONTAINS(UPPER(filer_naml), r'\\bCOUNTY\\b')
            )
            WHERE county IS NOT NULL
            GROUP BY county
            ORDER BY count DESC
            LIMIT 20
            """

            try:
                result_df = current_app.bigquery_client.query(counties_query).to_dataframe()

                counties = []
                for _, row in result_df.iterrows():
                    counties.append({
                        'label': str(row['county']).title(),
                        'value': str(row['county']).lower().replace(' ', '_'),
                        'count': int(row['count'])
                    })

                if counties:
                    return jsonify({
                        'success': True,
                        'data': counties
                    }), 200

            except Exception as e:
                current_app.logger.error(f"Counties BigQuery error: {str(e)}")

        # Fallback to mock data
        return jsonify({
            'success': True,
            'data': MOCK_COUNTIES
        }), 200

    except Exception as e:
        current_app.logger.error(f"Counties error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load counties'
        }), 500

@bp.route('/cities/<county>', methods=['GET'])
def get_cities(county):
    """Get cities for a specific county"""
    try:
        county_key = county.lower().replace(' ', '_')

        if current_app.bigquery_client:
            # Try to get from BigQuery
            cities_query = f"""
            SELECT
                city,
                COUNT(DISTINCT filing_id) as count
            FROM (
                SELECT
                    filing_id,
                    REGEXP_EXTRACT(UPPER(filer_naml), r'(\\b[A-Z\\s]+\\sCITY\\b|\\bCITY\\sOF\\s[A-Z\\s]+\\b)') as city
                FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
                WHERE UPPER(filer_naml) LIKE UPPER('%{county}%')
                AND (REGEXP_CONTAINS(UPPER(filer_naml), r'\\bCITY\\b'))
            )
            WHERE city IS NOT NULL
            GROUP BY city
            ORDER BY count DESC
            LIMIT 10
            """

            try:
                result_df = current_app.bigquery_client.query(cities_query).to_dataframe()

                cities = []
                for _, row in result_df.iterrows():
                    cities.append({
                        'label': str(row['city']).title(),
                        'value': str(row['city']).lower().replace(' ', '_'),
                        'count': int(row['count'])
                    })

                if cities:
                    return jsonify({
                        'success': True,
                        'data': cities
                    }), 200

            except Exception as e:
                current_app.logger.error(f"Cities BigQuery error: {str(e)}")

        # Fallback to mock data
        mock_cities = MOCK_CITIES.get(county_key, [])
        return jsonify({
            'success': True,
            'data': mock_cities
        }), 200

    except Exception as e:
        current_app.logger.error(f"Cities error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load cities'
        }), 500

@bp.route('/filing-periods', methods=['GET'])
def get_filing_periods():
    """Get available filing periods"""
    try:
        if current_app.bigquery_client:
            # Try to get from BigQuery
            periods_query = """
            SELECT DISTINCT
                rpt_date,
                EXTRACT(YEAR FROM rpt_date) as year,
                EXTRACT(QUARTER FROM rpt_date) as quarter
            FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
            WHERE rpt_date IS NOT NULL
            ORDER BY rpt_date DESC
            LIMIT 20
            """

            try:
                result_df = current_app.bigquery_client.query(periods_query).to_dataframe()

                periods = []
                for _, row in result_df.iterrows():
                    year = int(row['year'])
                    quarter = int(row['quarter'])
                    quarter_months = {1: 'Jan-Mar', 2: 'Apr-Jun', 3: 'Jul-Sep', 4: 'Oct-Dec'}

                    periods.append({
                        'label': f'{year} Q{quarter} ({quarter_months[quarter]})',
                        'value': f'{year}-Q{quarter}'
                    })

                if periods:
                    return jsonify({
                        'success': True,
                        'data': periods
                    }), 200

            except Exception as e:
                current_app.logger.error(f"Filing periods BigQuery error: {str(e)}")

        # Fallback to mock data
        return jsonify({
            'success': True,
            'data': MOCK_FILING_PERIODS
        }), 200

    except Exception as e:
        current_app.logger.error(f"Filing periods error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load filing periods'
        }), 500

@bp.route('/autocomplete/<field>', methods=['GET'])
def get_autocomplete_suggestions(field):
    """Get autocomplete suggestions for various fields"""
    try:
        query = request.args.get('query', '').strip()
        limit = min(20, max(1, int(request.args.get('limit', 10))))

        if not query or len(query) < 2:
            return jsonify({
                'success': True,
                'data': []
            }), 200

        # Get suggestions from BigQuery
        suggestions = get_autocomplete_from_bigquery(field, query, limit)

        # If BigQuery fails, provide mock suggestions
        if not suggestions:
            mock_suggestions = get_mock_autocomplete_suggestions(field, query, limit)
            suggestions = mock_suggestions

        return jsonify({
            'success': True,
            'data': suggestions
        }), 200

    except Exception as e:
        current_app.logger.error(f"Autocomplete error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to get autocomplete suggestions'
        }), 500

def get_mock_autocomplete_suggestions(field, query, limit):
    """Generate mock autocomplete suggestions"""
    mock_data = {
        'filers': [
            'Sacramento County Employees Retirement Association',
            'Los Angeles County Metropolitan Transportation Authority',
            'San Francisco Public Utilities Commission',
            'Orange County Transportation Authority',
            'Alameda County Congestion Management Agency',
        ],
        'firms': [
            'Capitol Advocacy LLC',
            'Golden Gate Public Affairs',
            'Sacramento Government Relations',
            'California Strategies',
            'State Capitol Advisors',
        ],
        'employers': [
            'California Hospital Association',
            'California Teachers Association',
            'California Chamber of Commerce',
            'California Real Estate Association',
            'California Association of Realtors',
        ]
    }

    base_list = mock_data.get(field, [])
    filtered = [item for item in base_list if query.lower() in item.lower()]

    suggestions = []
    for i, item in enumerate(filtered[:limit]):
        suggestions.append({
            'label': item,
            'value': item.lower().replace(' ', '_'),
            'count': 50 - (i * 5)  # Mock count
        })

    return suggestions

@bp.route('/statistics/summary', methods=['GET'])
def get_data_statistics():
    """Get overall data statistics"""
    try:
        if current_app.bigquery_client:
            stats_query = """
            SELECT
                COUNT(DISTINCT filing_id) as total_filings,
                COUNT(DISTINCT filer_naml) as unique_filers,
                COUNT(DISTINCT firm_name) as unique_firms,
                MIN(rpt_date) as earliest_date,
                MAX(rpt_date) as latest_date
            FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
            WHERE rpt_date IS NOT NULL
            """

            try:
                result_df = current_app.bigquery_client.query(stats_query).to_dataframe()

                if not result_df.empty:
                    row = result_df.iloc[0]
                    stats = {
                        'totalFilings': int(row['total_filings']),
                        'uniqueFilers': int(row['unique_filers']),
                        'uniqueFirms': int(row['unique_firms']),
                        'earliestDate': row['earliest_date'].strftime('%Y-%m-%d') if row['earliest_date'] else None,
                        'latestDate': row['latest_date'].strftime('%Y-%m-%d') if row['latest_date'] else None,
                        'dataSource': 'California Secretary of State',
                        'lastUpdated': '2024-09-16'
                    }

                    return jsonify({
                        'success': True,
                        'data': stats
                    }), 200

            except Exception as e:
                current_app.logger.error(f"Statistics BigQuery error: {str(e)}")

        # Fallback to mock statistics
        mock_stats = {
            'totalFilings': 15420,
            'uniqueFilers': 3247,
            'uniqueFirms': 892,
            'earliestDate': '2020-01-01',
            'latestDate': '2024-09-16',
            'dataSource': 'California Secretary of State',
            'lastUpdated': '2024-09-16'
        }

        return jsonify({
            'success': True,
            'data': mock_stats
        }), 200

    except Exception as e:
        current_app.logger.error(f"Data statistics error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load data statistics'
        }), 500

@bp.route('/health', methods=['GET'])
def data_health_check():
    """Check data service health"""
    try:
        health = {
            'status': 'healthy',
            'bigquery_connected': current_app.bigquery_client is not None,
            'redis_connected': current_app.redis_client is not None,
            'timestamp': '2024-09-16T12:00:00Z'
        }

        status_code = 200 if health['bigquery_connected'] else 503

        return jsonify({
            'success': True,
            'data': health
        }), status_code

    except Exception as e:
        current_app.logger.error(f"Data health check error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Health check failed'
        }), 500