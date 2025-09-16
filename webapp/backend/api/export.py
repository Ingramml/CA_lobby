"""
Export API endpoints
Handles data export in various formats (CSV, PDF, JSON, Excel)
"""
from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt
import pandas as pd
import json
import io
import csv
from datetime import datetime
import tempfile
import os

bp = Blueprint('export', __name__)

def check_export_permissions(user_role, row_count):
    """Check if user has permission to export data"""
    export_limits = {
        'GUEST': {'max_rows': 0, 'formats': []},
        'PUBLIC': {'max_rows': 1000, 'formats': ['CSV', 'JSON']},
        'RESEARCHER': {'max_rows': 10000, 'formats': ['CSV', 'PDF', 'JSON', 'EXCEL']},
        'JOURNALIST': {'max_rows': 50000, 'formats': ['CSV', 'PDF', 'JSON', 'EXCEL']},
        'ADMIN': {'max_rows': float('inf'), 'formats': ['CSV', 'PDF', 'JSON', 'EXCEL']}
    }

    limits = export_limits.get(user_role, export_limits['GUEST'])

    if row_count > limits['max_rows']:
        return False, f"Row limit exceeded. Maximum allowed: {limits['max_rows']}"

    return True, None

def check_format_permission(user_role, format_type):
    """Check if user can export in specified format"""
    format_permissions = {
        'GUEST': [],
        'PUBLIC': ['CSV', 'JSON'],
        'RESEARCHER': ['CSV', 'PDF', 'JSON', 'EXCEL'],
        'JOURNALIST': ['CSV', 'PDF', 'JSON', 'EXCEL'],
        'ADMIN': ['CSV', 'PDF', 'JSON', 'EXCEL']
    }

    allowed_formats = format_permissions.get(user_role, [])
    return format_type in allowed_formats

def export_to_csv(data, filename=None):
    """Export data to CSV format"""
    if not filename:
        filename = f"ca_lobby_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    output = io.StringIO()
    if data:
        # Get field names from first record
        fieldnames = data[0].keys() if data else []
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

    output.seek(0)
    return output.getvalue().encode('utf-8'), filename, 'text/csv'

def export_to_json(data, filename=None):
    """Export data to JSON format"""
    if not filename:
        filename = f"ca_lobby_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    export_data = {
        'metadata': {
            'exported_at': datetime.utcnow().isoformat(),
            'source': 'California Lobbying Transparency Portal',
            'record_count': len(data)
        },
        'data': data
    }

    json_data = json.dumps(export_data, indent=2, default=str)
    return json_data.encode('utf-8'), filename, 'application/json'

def export_to_excel(data, filename=None):
    """Export data to Excel format"""
    if not filename:
        filename = f"ca_lobby_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    if not data:
        # Create empty DataFrame
        df = pd.DataFrame()
    else:
        df = pd.DataFrame(data)

    # Create Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Lobbying Data', index=False)

        # Add metadata sheet
        metadata_df = pd.DataFrame({
            'Property': ['Export Date', 'Source', 'Record Count', 'Portal'],
            'Value': [
                datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
                'California Secretary of State',
                len(data),
                'CA Lobbying Transparency Portal'
            ]
        })
        metadata_df.to_excel(writer, sheet_name='Metadata', index=False)

    output.seek(0)
    return output.getvalue(), filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

def export_to_pdf(data, filename=None):
    """Export data to PDF format - simplified version"""
    if not filename:
        filename = f"ca_lobby_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

    # For this implementation, we'll convert to CSV first and return it
    # In a production environment, you'd use libraries like reportlab or weasyprint
    csv_data, _, _ = export_to_csv(data, filename.replace('.pdf', '.csv'))

    return csv_data, filename.replace('.pdf', '.csv'), 'text/csv'

@bp.route('/', methods=['POST'])
@jwt_required()
def export_data():
    """Export provided data in specified format"""
    try:
        claims = get_jwt()
        user_role = claims.get('role', 'PUBLIC')

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Export data and options required'
            }), 400

        export_data = data.get('data', [])
        options = data.get('options', {})

        format_type = options.get('format', 'CSV').upper()
        filename = options.get('filename')
        include_headers = options.get('includeHeaders', True)
        columns = options.get('columns')

        # Check format permission
        if not check_format_permission(user_role, format_type):
            return jsonify({
                'success': False,
                'message': f'Format {format_type} not allowed for {user_role} users'
            }), 403

        # Check row count limits
        row_count = len(export_data)
        can_export, error_msg = check_export_permissions(user_role, row_count)

        if not can_export:
            return jsonify({
                'success': False,
                'message': error_msg
            }), 403

        # Filter columns if specified
        if columns and export_data:
            filtered_data = []
            for record in export_data:
                filtered_record = {col: record.get(col, '') for col in columns}
                filtered_data.append(filtered_record)
            export_data = filtered_data

        # Export based on format
        if format_type == 'CSV':
            file_content, file_name, mime_type = export_to_csv(export_data, filename)
        elif format_type == 'JSON':
            file_content, file_name, mime_type = export_to_json(export_data, filename)
        elif format_type == 'EXCEL':
            file_content, file_name, mime_type = export_to_excel(export_data, filename)
        elif format_type == 'PDF':
            file_content, file_name, mime_type = export_to_pdf(export_data, filename)
        else:
            return jsonify({
                'success': False,
                'message': f'Unsupported format: {format_type}'
            }), 400

        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(file_content)
        temp_file.close()

        return send_file(
            temp_file.name,
            as_attachment=True,
            download_name=file_name,
            mimetype=mime_type
        )

    except Exception as e:
        current_app.logger.error(f"Export data error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Export failed'
        }), 500

@bp.route('/search/<search_type>', methods=['POST'])
@jwt_required()
def export_search_results(search_type):
    """Export search results directly"""
    try:
        claims = get_jwt()
        user_role = claims.get('role', 'PUBLIC')

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Search parameters and export options required'
            }), 400

        search_params = data.get('searchParams', {})
        options = data.get('options', {})

        # Import search functions
        from . import search as search_module

        # Execute search based on type
        if search_type == 'entities':
            # This would normally call the search function directly
            # For now, we'll return mock data
            search_results = generate_mock_export_data('entities', search_params)
        elif search_type == 'financial':
            search_results = generate_mock_export_data('financial', search_params)
        elif search_type == 'filings':
            search_results = generate_mock_export_data('filings', search_params)
        else:
            return jsonify({
                'success': False,
                'message': f'Invalid search type: {search_type}'
            }), 400

        # Use the regular export function
        export_request_data = {
            'data': search_results,
            'options': options
        }

        # Mock the request data for the export function
        request._cached_json = export_request_data

        return export_data()

    except Exception as e:
        current_app.logger.error(f"Export search results error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Search export failed'
        }), 500

@bp.route('/report/<report_id>', methods=['POST'])
@jwt_required()
def export_report(report_id):
    """Export report data"""
    try:
        claims = get_jwt()
        user_role = claims.get('role', 'PUBLIC')

        data = request.get_json()
        options = data.get('options', {}) if data else {}

        # Import reports functions
        from . import reports as reports_module

        # Get report data (this would normally regenerate the report)
        report_data = generate_mock_report_export_data(report_id)

        # Use the regular export function
        export_request_data = {
            'data': report_data,
            'options': options
        }

        # Mock the request data for the export function
        request._cached_json = export_request_data

        return export_data()

    except Exception as e:
        current_app.logger.error(f"Export report error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Report export failed'
        }), 500

def generate_mock_export_data(search_type, params):
    """Generate mock data for export testing"""
    mock_data = []

    for i in range(25):  # Generate 25 sample records
        if search_type == 'entities':
            record = {
                'filing_id': f'10{100000 + i}',
                'filer_name': f'Sample Entity {i + 1}',
                'firm_name': f'Sample Firm {i + 1}',
                'report_date': '2024-09-01',
                'total_amount': 10000 + (i * 1500),
                'status': 'Active',
                'county': 'Sacramento'
            }
        elif search_type == 'financial':
            record = {
                'filing_id': f'10{100000 + i}',
                'filer_name': f'Sample Filer {i + 1}',
                'employer_name': f'Sample Employer {i + 1}',
                'fees_amount': 8000 + (i * 1000),
                'reimbursement_amount': 1000 + (i * 200),
                'advance_amount': 500 + (i * 100),
                'total_amount': 9500 + (i * 1300),
                'report_date': '2024-09-01'
            }
        else:  # filings
            record = {
                'filing_id': f'10{100000 + i}',
                'filer_name': f'Sample Filer {i + 1}',
                'firm_name': f'Sample Firm {i + 1}',
                'report_date': '2024-09-01',
                'amendment_id': 0,
                'status': 'Active',
                'total_amount': 12000 + (i * 1800)
            }

        mock_data.append(record)

    return mock_data

def generate_mock_report_export_data(report_id):
    """Generate mock report data for export"""
    if 'financial' in report_id:
        return [
            {'county': 'Los Angeles County', 'total_fees': 125000, 'filing_count': 12},
            {'county': 'Sacramento County', 'total_fees': 95000, 'filing_count': 8},
            {'county': 'Orange County', 'total_fees': 78000, 'filing_count': 6},
        ]
    elif 'entities' in report_id:
        return [
            {'firm_name': 'Capitol Strategies LLC', 'filing_count': 45, 'unique_filers': 12},
            {'firm_name': 'Golden Gate Government Relations', 'filing_count': 38, 'unique_filers': 9},
            {'firm_name': 'Sacramento Advocacy Group', 'filing_count': 31, 'unique_filers': 7},
        ]
    else:
        return [
            {'category': 'Sample Category 1', 'value': 100, 'count': 50},
            {'category': 'Sample Category 2', 'value': 85, 'count': 42},
            {'category': 'Sample Category 3', 'value': 70, 'count': 35},
        ]

@bp.route('/limits', methods=['GET'])
@jwt_required(optional=True)
def get_export_limits():
    """Get export limits for current user"""
    try:
        user_role = 'GUEST'
        if get_jwt():
            claims = get_jwt()
            user_role = claims.get('role', 'GUEST')

        limits = {
            'GUEST': {'maxRows': 0, 'maxExportsPerDay': 0, 'allowedFormats': []},
            'PUBLIC': {'maxRows': 1000, 'maxExportsPerDay': 5, 'allowedFormats': ['CSV', 'JSON']},
            'RESEARCHER': {'maxRows': 10000, 'maxExportsPerDay': 20, 'allowedFormats': ['CSV', 'PDF', 'JSON', 'EXCEL']},
            'JOURNALIST': {'maxRows': 50000, 'maxExportsPerDay': -1, 'allowedFormats': ['CSV', 'PDF', 'JSON', 'EXCEL']},
            'ADMIN': {'maxRows': -1, 'maxExportsPerDay': -1, 'allowedFormats': ['CSV', 'PDF', 'JSON', 'EXCEL']}
        }

        user_limits = limits.get(user_role, limits['GUEST'])

        return jsonify({
            'success': True,
            'data': {
                'role': user_role,
                'limits': user_limits,
                'exportHistory': {
                    'todayCount': 0,  # Would be fetched from database
                    'remainingToday': user_limits['maxExportsPerDay'] if user_limits['maxExportsPerDay'] > 0 else 'Unlimited'
                }
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get export limits error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to get export limits'
        }), 500

@bp.route('/formats', methods=['GET'])
def get_available_formats():
    """Get information about available export formats"""
    try:
        formats = [
            {
                'format': 'CSV',
                'name': 'Comma Separated Values',
                'description': 'Plain text format, compatible with Excel and most data tools',
                'extension': '.csv',
                'mimetype': 'text/csv'
            },
            {
                'format': 'JSON',
                'name': 'JavaScript Object Notation',
                'description': 'Structured data format, ideal for developers and APIs',
                'extension': '.json',
                'mimetype': 'application/json'
            },
            {
                'format': 'EXCEL',
                'name': 'Microsoft Excel',
                'description': 'Native Excel format with multiple sheets and formatting',
                'extension': '.xlsx',
                'mimetype': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            {
                'format': 'PDF',
                'name': 'Portable Document Format',
                'description': 'Formatted document for sharing and printing',
                'extension': '.pdf',
                'mimetype': 'application/pdf'
            }
        ]

        return jsonify({
            'success': True,
            'data': formats
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get available formats error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to get available formats'
        }), 500