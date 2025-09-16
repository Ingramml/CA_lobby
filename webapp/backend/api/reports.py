"""
Reports API endpoints
Handles pre-built and custom report generation
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, timedelta
import json
import uuid

bp = Blueprint('reports', __name__)

# Pre-defined report templates
PREDEFINED_REPORTS = {
    'financial_top_lobbyists': {
        'id': 'financial_top_lobbyists',
        'name': 'Top Lobbyist Payments by County',
        'description': 'Analysis of highest lobbyist payments organized by county',
        'category': 'FINANCIAL_ANALYSIS',
        'query': """
        SELECT
            REGEXP_EXTRACT(UPPER(cvr.filer_naml), r'(\\b[A-Z\\s]+\\sCOUNTY\\b)') as county,
            cvr.filer_naml as filer_name,
            SUM(CAST(pay.fees_amt AS FLOAT64)) as total_fees,
            SUM(CAST(pay.reimb_amt AS FLOAT64)) as total_reimbursements,
            SUM(CAST(pay.advan_amt AS FLOAT64)) as total_advances,
            COUNT(DISTINCT cvr.filing_id) as filing_count
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd` cvr
        JOIN `ca-lobby.ca_lobby.lpay_cd` pay ON cvr.filing_id = pay.filing_id
        WHERE REGEXP_CONTAINS(UPPER(cvr.filer_naml), r'\\bCOUNTY\\b')
        AND cvr.rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY county, cvr.filer_naml
        ORDER BY total_fees DESC
        LIMIT 50
        """,
        'parameters': {'timeframe': '12_months'},
        'visualizations': ['bar_chart', 'table']
    },
    'financial_quarterly_trends': {
        'id': 'financial_quarterly_trends',
        'name': 'Quarterly Spending Trends',
        'description': 'Quarterly trends in lobbying expenditures',
        'category': 'FINANCIAL_ANALYSIS',
        'query': """
        SELECT
            EXTRACT(YEAR FROM cvr.rpt_date) as year,
            EXTRACT(QUARTER FROM cvr.rpt_date) as quarter,
            SUM(CAST(pay.fees_amt AS FLOAT64)) as total_fees,
            SUM(CAST(pay.reimb_amt AS FLOAT64)) as total_reimbursements,
            COUNT(DISTINCT cvr.filing_id) as filing_count
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd` cvr
        JOIN `ca-lobby.ca_lobby.lpay_cd` pay ON cvr.filing_id = pay.filing_id
        WHERE cvr.rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 24 MONTH)
        GROUP BY year, quarter
        ORDER BY year DESC, quarter DESC
        """,
        'parameters': {},
        'visualizations': ['line_chart', 'table']
    },
    'entities_most_active_firms': {
        'id': 'entities_most_active_firms',
        'name': 'Most Active Lobbying Firms',
        'description': 'Ranking of most active lobbying firms by filing count',
        'category': 'ENTITY_ANALYSIS',
        'query': """
        SELECT
            firm_name,
            COUNT(DISTINCT filing_id) as filing_count,
            COUNT(DISTINCT filer_naml) as unique_filers,
            MIN(rpt_date) as first_filing,
            MAX(rpt_date) as latest_filing
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
        WHERE firm_name IS NOT NULL
        AND firm_name != ''
        AND rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY firm_name
        ORDER BY filing_count DESC
        LIMIT 25
        """,
        'parameters': {},
        'visualizations': ['bar_chart', 'table']
    },
    'geographic_county_spending': {
        'id': 'geographic_county_spending',
        'name': 'County-by-County Spending Analysis',
        'description': 'Lobbying activity and spending by California county',
        'category': 'GEOGRAPHIC_REPORTS',
        'query': """
        SELECT
            REGEXP_EXTRACT(UPPER(filer_naml), r'(\\b[A-Z\\s]+\\sCOUNTY\\b)') as county,
            COUNT(DISTINCT filing_id) as filing_count,
            COUNT(DISTINCT filer_naml) as unique_filers,
            AVG(CAST(REGEXP_EXTRACT(fees_amt, r'\\d+') AS FLOAT64)) as avg_fees
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd` cvr
        LEFT JOIN `ca-lobby.ca_lobby.lpay_cd` pay ON cvr.filing_id = pay.filing_id
        WHERE REGEXP_CONTAINS(UPPER(filer_naml), r'\\bCOUNTY\\b')
        GROUP BY county
        HAVING county IS NOT NULL
        ORDER BY filing_count DESC
        """,
        'parameters': {},
        'visualizations': ['heatmap', 'bar_chart', 'table']
    },
    'timeseries_monthly_trends': {
        'id': 'timeseries_monthly_trends',
        'name': 'Monthly Payment Trends',
        'description': 'Monthly trends in lobbying payments over time',
        'category': 'TIME_SERIES_REPORTS',
        'query': """
        SELECT
            EXTRACT(YEAR FROM rpt_date) as year,
            EXTRACT(MONTH FROM rpt_date) as month,
            COUNT(DISTINCT filing_id) as filing_count,
            COUNT(DISTINCT filer_naml) as unique_filers
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
        WHERE rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 24 MONTH)
        GROUP BY year, month
        ORDER BY year, month
        """,
        'parameters': {},
        'visualizations': ['line_chart', 'table']
    }
}

def execute_report_query(query, parameters=None):
    """Execute a report query against BigQuery"""
    if not current_app.bigquery_client:
        return generate_mock_report_data(query)

    try:
        # Apply parameters to query if needed
        formatted_query = query
        if parameters:
            # Simple parameter substitution - in production, use proper parameterized queries
            for key, value in parameters.items():
                formatted_query = formatted_query.replace(f'${key}', str(value))

        result_df = current_app.bigquery_client.query(formatted_query).to_dataframe()

        # Convert DataFrame to list of dictionaries
        data = []
        for _, row in result_df.iterrows():
            row_dict = {}
            for col in result_df.columns:
                value = row[col]
                if hasattr(value, 'isoformat'):  # Handle dates
                    row_dict[col] = value.isoformat()
                elif hasattr(value, 'item'):  # Handle numpy types
                    row_dict[col] = value.item()
                else:
                    row_dict[col] = value
            data.append(row_dict)

        return data

    except Exception as e:
        current_app.logger.error(f"Report query error: {str(e)}")
        return generate_mock_report_data(query)

def generate_mock_report_data(query):
    """Generate mock data for report testing"""
    # Different mock data based on query type
    if 'county' in query.lower():
        return [
            {'county': 'Los Angeles County', 'filer_name': 'LA County Metro', 'total_fees': 125000, 'filing_count': 12},
            {'county': 'Sacramento County', 'filer_name': 'Sacramento Transit', 'total_fees': 95000, 'filing_count': 8},
            {'county': 'Orange County', 'filer_name': 'OC Transportation', 'total_fees': 78000, 'filing_count': 6},
        ]
    elif 'quarterly' in query.lower() or 'quarter' in query.lower():
        return [
            {'year': 2024, 'quarter': 3, 'total_fees': 450000, 'filing_count': 145},
            {'year': 2024, 'quarter': 2, 'total_fees': 423000, 'filing_count': 138},
            {'year': 2024, 'quarter': 1, 'total_fees': 398000, 'filing_count': 142},
        ]
    elif 'firm' in query.lower():
        return [
            {'firm_name': 'Capitol Strategies LLC', 'filing_count': 45, 'unique_filers': 12},
            {'firm_name': 'Golden Gate Government Relations', 'filing_count': 38, 'unique_filers': 9},
            {'firm_name': 'Sacramento Advocacy Group', 'filing_count': 31, 'unique_filers': 7},
        ]
    else:
        return [
            {'category': 'Sample Data', 'value': 100, 'count': 50},
            {'category': 'More Sample Data', 'value': 85, 'count': 42},
        ]

def generate_chart_data(data, visualizations):
    """Generate chart configurations from report data"""
    charts = []

    for viz_type in visualizations:
        if viz_type == 'bar_chart':
            charts.append({
                'type': 'bar',
                'title': 'Bar Chart Analysis',
                'data': {
                    'labels': [str(row.get('county', row.get('firm_name', row.get('category', f'Item {i}')))) for i, row in enumerate(data[:10])],
                    'datasets': [{
                        'label': 'Total Fees',
                        'data': [row.get('total_fees', row.get('filing_count', row.get('value', 0))) for row in data[:10]],
                        'backgroundColor': 'rgba(25, 118, 210, 0.8)'
                    }]
                },
                'options': {
                    'responsive': True,
                    'plugins': {
                        'legend': {
                            'position': 'top'
                        }
                    }
                }
            })

        elif viz_type == 'line_chart':
            charts.append({
                'type': 'line',
                'title': 'Trend Analysis',
                'data': {
                    'labels': [f"{row.get('year', 2024)}-Q{row.get('quarter', 1)}" if 'quarter' in str(row) else f"Period {i+1}" for i, row in enumerate(data[:12])],
                    'datasets': [{
                        'label': 'Total Fees',
                        'data': [row.get('total_fees', row.get('filing_count', row.get('value', 0))) for row in data[:12]],
                        'borderColor': 'rgba(25, 118, 210, 1)',
                        'backgroundColor': 'rgba(25, 118, 210, 0.1)'
                    }]
                },
                'options': {
                    'responsive': True,
                    'plugins': {
                        'legend': {
                            'position': 'top'
                        }
                    }
                }
            })

        elif viz_type == 'pie_chart':
            charts.append({
                'type': 'pie',
                'title': 'Distribution Analysis',
                'data': {
                    'labels': [str(row.get('county', row.get('firm_name', row.get('category', f'Item {i}')))) for i, row in enumerate(data[:8])],
                    'datasets': [{
                        'data': [row.get('total_fees', row.get('filing_count', row.get('value', 0))) for row in data[:8]],
                        'backgroundColor': [
                            'rgba(25, 118, 210, 0.8)',
                            'rgba(220, 0, 78, 0.8)',
                            'rgba(46, 125, 50, 0.8)',
                            'rgba(237, 108, 2, 0.8)',
                            'rgba(211, 47, 47, 0.8)',
                            'rgba(2, 136, 209, 0.8)',
                            'rgba(100, 116, 139, 0.8)',
                            'rgba(156, 39, 176, 0.8)'
                        ]
                    }]
                }
            })

    return charts

@bp.route('/predefined', methods=['GET'])
def get_predefined_reports():
    """Get list of available predefined reports"""
    try:
        reports = []
        for report_id, report_config in PREDEFINED_REPORTS.items():
            reports.append({
                'id': report_config['id'],
                'name': report_config['name'],
                'description': report_config['description'],
                'category': report_config['category'],
                'createdDate': '2024-09-16T00:00:00Z',
                'isCustom': False
            })

        return jsonify({
            'success': True,
            'data': reports
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get predefined reports error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load predefined reports'
        }), 500

@bp.route('/predefined/<report_id>/generate', methods=['POST'])
@jwt_required(optional=True)
def generate_predefined_report(report_id):
    """Generate a predefined report"""
    try:
        if report_id not in PREDEFINED_REPORTS:
            return jsonify({
                'success': False,
                'message': 'Report not found'
            }), 404

        data = request.get_json() or {}
        parameters = data.get('parameters', {})

        report_config = PREDEFINED_REPORTS[report_id]

        # Execute the report query
        report_data = execute_report_query(report_config['query'], parameters)

        # Generate visualizations
        charts = generate_chart_data(report_data, report_config.get('visualizations', []))

        result = {
            'reportId': report_id,
            'data': report_data,
            'charts': charts,
            'metadata': {
                'generatedAt': datetime.utcnow().isoformat(),
                'rowCount': len(report_data),
                'parameters': {**report_config.get('parameters', {}), **parameters}
            }
        }

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        current_app.logger.error(f"Generate predefined report error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to generate report'
        }), 500

@bp.route('/custom/generate', methods=['POST'])
@jwt_required()
def generate_custom_report():
    """Generate a custom report"""
    try:
        claims = get_jwt()
        user_role = claims.get('role', 'PUBLIC')

        # Check permissions
        if user_role not in ['RESEARCHER', 'JOURNALIST', 'ADMIN']:
            return jsonify({
                'success': False,
                'message': 'Insufficient permissions for custom reports'
            }), 403

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Report configuration required'
            }), 400

        report_name = data.get('name', 'Untitled Report')
        query = data.get('query', '')
        parameters = data.get('parameters', {})
        visualizations = data.get('visualizations', ['table'])

        if not query:
            return jsonify({
                'success': False,
                'message': 'SQL query is required'
            }), 400

        # Validate query (basic security check)
        if not is_query_safe(query):
            return jsonify({
                'success': False,
                'message': 'Query contains unsafe operations'
            }), 400

        # Execute the custom query
        report_data = execute_report_query(query, parameters)

        # Generate visualizations
        charts = generate_chart_data(report_data, visualizations)

        result = {
            'reportId': str(uuid.uuid4()),
            'data': report_data,
            'charts': charts,
            'metadata': {
                'generatedAt': datetime.utcnow().isoformat(),
                'rowCount': len(report_data),
                'parameters': parameters,
                'name': report_name
            }
        }

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        current_app.logger.error(f"Generate custom report error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to generate custom report'
        }), 500

@bp.route('/custom/save', methods=['POST'])
@jwt_required()
def save_custom_report():
    """Save a custom report configuration"""
    try:
        claims = get_jwt()
        user_role = claims.get('role', 'PUBLIC')
        user_id = claims.get('sub', 'unknown')

        # Check permissions
        if user_role not in ['RESEARCHER', 'JOURNALIST', 'ADMIN']:
            return jsonify({
                'success': False,
                'message': 'Insufficient permissions to save reports'
            }), 403

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Report configuration required'
            }), 400

        # In a real application, this would be saved to a database
        saved_report = {
            'id': str(uuid.uuid4()),
            'name': data.get('name', 'Untitled Report'),
            'description': data.get('description', ''),
            'category': 'CUSTOM',
            'createdBy': user_id,
            'createdDate': datetime.utcnow().isoformat(),
            'isCustom': True,
            'query': data.get('query', ''),
            'parameters': data.get('parameters', {}),
            'visualizations': data.get('visualizations', ['table'])
        }

        return jsonify({
            'success': True,
            'data': saved_report
        }), 201

    except Exception as e:
        current_app.logger.error(f"Save custom report error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to save report'
        }), 500

@bp.route('/my-reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    """Get user's saved custom reports"""
    try:
        claims = get_jwt()
        user_id = claims.get('sub', 'unknown')

        # In a real application, this would query a database
        # For now, return empty list
        my_reports = []

        return jsonify({
            'success': True,
            'data': my_reports
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get my reports error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load user reports'
        }), 500

def is_query_safe(query):
    """Basic SQL injection protection for custom queries"""
    dangerous_keywords = [
        'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE',
        'TRUNCATE', 'EXEC', 'EXECUTE', 'SCRIPT', 'MERGE'
    ]

    query_upper = query.upper()
    for keyword in dangerous_keywords:
        if keyword in query_upper:
            return False

    return True

@bp.route('/categories', methods=['GET'])
def get_report_categories():
    """Get available report categories"""
    try:
        categories = [
            {
                'id': 'FINANCIAL_ANALYSIS',
                'name': 'Financial Analysis',
                'description': 'Payment trends, spending analysis, and financial reporting'
            },
            {
                'id': 'ENTITY_ANALYSIS',
                'name': 'Entity Analysis',
                'description': 'Lobbyist and firm activity, relationship analysis'
            },
            {
                'id': 'GEOGRAPHIC_REPORTS',
                'name': 'Geographic Reports',
                'description': 'County and regional lobbying activity analysis'
            },
            {
                'id': 'TIME_SERIES_REPORTS',
                'name': 'Time Series Reports',
                'description': 'Trends and patterns over time'
            }
        ]

        return jsonify({
            'success': True,
            'data': categories
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get report categories error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load report categories'
        }), 500