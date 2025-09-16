"""
Search API endpoints
Handles entity, financial, and filing searches with BigQuery integration
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime
import json
import re

bp = Blueprint('search', __name__)

def build_entity_search_query(params, pagination):
    """Build BigQuery SQL for entity search"""
    base_query = """
    WITH base_data AS (
        SELECT DISTINCT
            cvr.filing_id,
            cvr.filer_naml,
            cvr.firm_name,
            cvr.rpt_date,
            cvr.from_date,
            cvr.thru_date,
            cvr.amend_id,
            COALESCE(pay.total_fees, 0) + COALESCE(pay.total_reimb, 0) + COALESCE(pay.total_advan, 0) as total_amount,
            'Active' as status,
            ROW_NUMBER() OVER (
                PARTITION BY cvr.filing_id
                ORDER BY cvr.amend_id DESC
            ) as row_num
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd` cvr
        LEFT JOIN (
            SELECT
                filing_id,
                SUM(CAST(fees_amt AS FLOAT64)) as total_fees,
                SUM(CAST(reimb_amt AS FLOAT64)) as total_reimb,
                SUM(CAST(advan_amt AS FLOAT64)) as total_advan
            FROM `ca-lobby.ca_lobby.lpay_cd`
            GROUP BY filing_id
        ) pay ON cvr.filing_id = pay.filing_id
        WHERE 1=1
    """

    conditions = []

    # Add search conditions based on parameters
    if params.get('filerName'):
        conditions.append(f"AND UPPER(cvr.filer_naml) LIKE UPPER('%{params['filerName']}%')")

    if params.get('firmName'):
        conditions.append(f"AND UPPER(cvr.firm_name) LIKE UPPER('%{params['firmName']}%')")

    if params.get('employerName'):
        # This would need to be joined with the employer data
        conditions.append(f"AND cvr.filing_id IN (SELECT filing_id FROM `ca-lobby.ca_lobby.lpay_cd` WHERE UPPER(emplr_naml) LIKE UPPER('%{params['employerName']}%'))")

    if params.get('registrationDateFrom'):
        conditions.append(f"AND cvr.rpt_date >= '{params['registrationDateFrom']}'")

    if params.get('registrationDateTo'):
        conditions.append(f"AND cvr.rpt_date <= '{params['registrationDateTo']}'")

    # Add county filter if exists
    if params.get('counties'):
        county_conditions = []
        for county in params['counties']:
            county_conditions.append(f"UPPER(cvr.filer_naml) LIKE UPPER('%{county}%')")
        if county_conditions:
            conditions.append(f"AND ({' OR '.join(county_conditions)})")

    query = base_query + ' '.join(conditions)

    # Add final selection and pagination
    query += """
    )
    SELECT
        filing_id,
        filer_naml as filer_name,
        firm_name,
        rpt_date as report_date,
        from_date,
        thru_date,
        total_amount,
        status,
        amend_id as amendment_id,
        CASE WHEN row_num = 1 THEN true ELSE false END as latest_amendment_flag,
        '' as county,
        '' as city,
        '' as employer_name,
        '' as line_item,
        0 as fees_amount,
        0 as reimbursement_amount,
        0 as advance_amount,
        '' as advance_description,
        0 as period_total,
        0 as cumulative_total
    FROM base_data
    WHERE row_num = 1
    ORDER BY rpt_date DESC, amendment_id DESC
    """

    # Add pagination
    offset = (pagination['page'] - 1) * pagination['pageSize']
    query += f" LIMIT {pagination['pageSize']} OFFSET {offset}"

    return query

def build_financial_search_query(params, pagination):
    """Build BigQuery SQL for financial search"""
    base_query = """
    WITH payment_data AS (
        SELECT
            cvr.filing_id,
            cvr.filer_naml,
            cvr.firm_name,
            cvr.rpt_date,
            cvr.from_date,
            cvr.thru_date,
            cvr.amend_id,
            pay.line_item,
            pay.emplr_naml,
            CAST(pay.fees_amt AS FLOAT64) as fees_amount,
            CAST(pay.reimb_amt AS FLOAT64) as reimb_amount,
            CAST(pay.advan_amt AS FLOAT64) as advan_amount,
            pay.advan_dscr,
            CAST(pay.per_total AS FLOAT64) as per_total,
            CAST(pay.cum_total AS FLOAT64) as cum_total,
            COALESCE(CAST(pay.fees_amt AS FLOAT64), 0) +
            COALESCE(CAST(pay.reimb_amt AS FLOAT64), 0) +
            COALESCE(CAST(pay.advan_amt AS FLOAT64), 0) as total_amount,
            ROW_NUMBER() OVER (
                PARTITION BY pay.filing_id, pay.line_item
                ORDER BY cvr.amend_id DESC
            ) as row_num
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd` cvr
        INNER JOIN `ca-lobby.ca_lobby.lpay_cd` pay ON cvr.filing_id = pay.filing_id
        WHERE 1=1
    """

    conditions = []

    # Amount range filters
    if params.get('amountMin'):
        conditions.append(f"AND (COALESCE(CAST(pay.fees_amt AS FLOAT64), 0) + COALESCE(CAST(pay.reimb_amt AS FLOAT64), 0) + COALESCE(CAST(pay.advan_amt AS FLOAT64), 0)) >= {params['amountMin']}")

    if params.get('amountMax'):
        conditions.append(f"AND (COALESCE(CAST(pay.fees_amt AS FLOAT64), 0) + COALESCE(CAST(pay.reimb_amt AS FLOAT64), 0) + COALESCE(CAST(pay.advan_amt AS FLOAT64), 0)) <= {params['amountMax']}")

    # Date range filters
    if params.get('reportDateFrom'):
        conditions.append(f"AND cvr.rpt_date >= '{params['reportDateFrom']}'")

    if params.get('reportDateTo'):
        conditions.append(f"AND cvr.rpt_date <= '{params['reportDateTo']}'")

    # Payment type filters
    if params.get('paymentTypes'):
        payment_conditions = []
        for payment_type in params['paymentTypes']:
            if payment_type == 'LOBBYING_FEES':
                payment_conditions.append("CAST(pay.fees_amt AS FLOAT64) > 0")
            elif payment_type == 'REIMBURSEMENTS':
                payment_conditions.append("CAST(pay.reimb_amt AS FLOAT64) > 0")
            elif payment_type == 'ADVANCES':
                payment_conditions.append("CAST(pay.advan_amt AS FLOAT64) > 0")

        if payment_conditions:
            conditions.append(f"AND ({' OR '.join(payment_conditions)})")

    query = base_query + ' '.join(conditions)

    # Add final selection and pagination
    query += """
    )
    SELECT
        filing_id,
        filer_naml as filer_name,
        firm_name,
        emplr_naml as employer_name,
        rpt_date as report_date,
        from_date,
        thru_date,
        line_item,
        fees_amount,
        reimb_amount as reimbursement_amount,
        advan_amount as advance_amount,
        advan_dscr as advance_description,
        per_total as period_total,
        cum_total as cumulative_total,
        total_amount,
        amend_id as amendment_id,
        CASE WHEN row_num = 1 THEN true ELSE false END as latest_amendment_flag,
        'Active' as status,
        '' as county,
        '' as city
    FROM payment_data
    WHERE row_num = 1
    ORDER BY total_amount DESC, report_date DESC
    """

    # Add pagination
    offset = (pagination['page'] - 1) * pagination['pageSize']
    query += f" LIMIT {pagination['pageSize']} OFFSET {offset}"

    return query

def build_filing_search_query(params, pagination):
    """Build BigQuery SQL for filing search"""
    base_query = """
    SELECT
        cvr.filing_id,
        cvr.filer_naml as filer_name,
        cvr.firm_name,
        cvr.rpt_date as report_date,
        cvr.from_date,
        cvr.thru_date,
        cvr.amend_id as amendment_id,
        CASE WHEN cvr.amend_id = 0 THEN 'Original' ELSE 'Amended' END as filing_status,
        'Active' as status,
        COALESCE(pay_summary.total_amount, 0) as total_amount,
        true as latest_amendment_flag,
        '' as county,
        '' as city,
        '' as employer_name,
        '' as line_item,
        0 as fees_amount,
        0 as reimbursement_amount,
        0 as advance_amount,
        '' as advance_description,
        0 as period_total,
        0 as cumulative_total
    FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd` cvr
    LEFT JOIN (
        SELECT
            filing_id,
            SUM(COALESCE(CAST(fees_amt AS FLOAT64), 0) + COALESCE(CAST(reimb_amt AS FLOAT64), 0) + COALESCE(CAST(advan_amt AS FLOAT64), 0)) as total_amount
        FROM `ca-lobby.ca_lobby.lpay_cd`
        GROUP BY filing_id
    ) pay_summary ON cvr.filing_id = pay_summary.filing_id
    WHERE 1=1
    """

    conditions = []

    # Filing ID exact search
    if params.get('filingId'):
        conditions.append(f"AND cvr.filing_id = '{params['filingId']}'")

    # Filing status filter
    if params.get('filingStatus') and params['filingStatus'] != 'All':
        if params['filingStatus'] == 'Original':
            conditions.append("AND cvr.amend_id = 0")
        elif params['filingStatus'] == 'Amended':
            conditions.append("AND cvr.amend_id > 0")

    # Latest amendment only
    if params.get('latestAmendmentOnly'):
        conditions.append("""
        AND cvr.amend_id = (
            SELECT MAX(amend_id)
            FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd` cvr2
            WHERE cvr2.filing_id = cvr.filing_id
        )
        """)

    query = base_query + ' '.join(conditions)
    query += " ORDER BY cvr.rpt_date DESC, cvr.amend_id DESC"

    # Add pagination
    offset = (pagination['page'] - 1) * pagination['pageSize']
    query += f" LIMIT {pagination['pageSize']} OFFSET {offset}"

    return query

def get_total_count_query(search_type, params):
    """Get count query for pagination"""
    if search_type == 'entities':
        return """
        SELECT COUNT(DISTINCT filing_id) as total_count
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
        WHERE 1=1
        """
    elif search_type == 'financial':
        return """
        SELECT COUNT(*) as total_count
        FROM `ca-lobby.ca_lobby.lpay_cd`
        WHERE 1=1
        """
    else:  # filings
        return """
        SELECT COUNT(*) as total_count
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
        WHERE 1=1
        """

@bp.route('/entities', methods=['POST'])
@jwt_required(optional=True)
def search_entities():
    """Search for lobbying entities"""
    try:
        data = request.get_json() or {}
        params = data.get('params', {})
        pagination = data.get('pagination', {'page': 1, 'pageSize': 25})

        # Validate pagination
        pagination['page'] = max(1, pagination.get('page', 1))
        pagination['pageSize'] = min(100, max(1, pagination.get('pageSize', 25)))

        if not current_app.bigquery_client:
            return jsonify({
                'success': False,
                'message': 'Database connection not available'
            }), 503

        # Build and execute query
        query = build_entity_search_query(params, pagination)

        try:
            result_df = current_app.bigquery_client.query(query).to_dataframe()

            # Convert DataFrame to list of dictionaries
            results = []
            for _, row in result_df.iterrows():
                filing_data = {
                    'filing_id': str(row.get('filing_id', '')),
                    'filer_name': str(row.get('filer_name', '')),
                    'firm_name': str(row.get('firm_name', '')),
                    'employer_name': str(row.get('employer_name', '')),
                    'report_date': row.get('report_date').strftime('%Y-%m-%d') if row.get('report_date') else '',
                    'from_date': row.get('from_date').strftime('%Y-%m-%d') if row.get('from_date') else '',
                    'thru_date': row.get('thru_date').strftime('%Y-%m-%d') if row.get('thru_date') else '',
                    'total_amount': float(row.get('total_amount', 0)),
                    'county': str(row.get('county', '')),
                    'city': str(row.get('city', '')),
                    'status': str(row.get('status', 'Active')),
                    'amendment_id': int(row.get('amendment_id', 0)),
                    'line_item': str(row.get('line_item', '')),
                    'fees_amount': float(row.get('fees_amount', 0)),
                    'reimbursement_amount': float(row.get('reimbursement_amount', 0)),
                    'advance_amount': float(row.get('advance_amount', 0)),
                    'advance_description': str(row.get('advance_description', '')),
                    'period_total': float(row.get('period_total', 0)),
                    'cumulative_total': float(row.get('cumulative_total', 0)),
                    'latest_amendment_flag': bool(row.get('latest_amendment_flag', True))
                }
                results.append(filing_data)

            # Get total count for pagination
            total_count = len(results)  # Simplified for demo
            total_pages = (total_count + pagination['pageSize'] - 1) // pagination['pageSize']

            response_data = {
                'data': results,
                'pagination': {
                    'currentPage': pagination['page'],
                    'totalPages': max(1, total_pages),
                    'totalCount': total_count,
                    'pageSize': pagination['pageSize'],
                    'hasNextPage': pagination['page'] < total_pages,
                    'hasPreviousPage': pagination['page'] > 1
                }
            }

            return jsonify({
                'success': True,
                'data': response_data
            }), 200

        except Exception as e:
            current_app.logger.error(f"BigQuery execution error: {str(e)}")
            # Return mock data as fallback
            return get_mock_search_results('entities', params, pagination)

    except Exception as e:
        current_app.logger.error(f"Entity search error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to execute entity search'
        }), 500

@bp.route('/financial', methods=['POST'])
@jwt_required(optional=True)
def search_financial():
    """Search for financial data"""
    try:
        data = request.get_json() or {}
        params = data.get('params', {})
        pagination = data.get('pagination', {'page': 1, 'pageSize': 25})

        # Validate pagination
        pagination['page'] = max(1, pagination.get('page', 1))
        pagination['pageSize'] = min(100, max(1, pagination.get('pageSize', 25)))

        if not current_app.bigquery_client:
            return get_mock_search_results('financial', params, pagination)

        # Build and execute query
        query = build_financial_search_query(params, pagination)

        try:
            result_df = current_app.bigquery_client.query(query).to_dataframe()

            # Process results similar to entities
            results = []
            for _, row in result_df.iterrows():
                filing_data = {
                    'filing_id': str(row.get('filing_id', '')),
                    'filer_name': str(row.get('filer_name', '')),
                    'firm_name': str(row.get('firm_name', '')),
                    'employer_name': str(row.get('employer_name', '')),
                    'report_date': row.get('report_date').strftime('%Y-%m-%d') if row.get('report_date') else '',
                    'from_date': row.get('from_date').strftime('%Y-%m-%d') if row.get('from_date') else '',
                    'thru_date': row.get('thru_date').strftime('%Y-%m-%d') if row.get('thru_date') else '',
                    'total_amount': float(row.get('total_amount', 0)),
                    'county': str(row.get('county', '')),
                    'city': str(row.get('city', '')),
                    'status': str(row.get('status', 'Active')),
                    'amendment_id': int(row.get('amendment_id', 0)),
                    'line_item': str(row.get('line_item', '')),
                    'fees_amount': float(row.get('fees_amount', 0)),
                    'reimbursement_amount': float(row.get('reimbursement_amount', 0)),
                    'advance_amount': float(row.get('advance_amount', 0)),
                    'advance_description': str(row.get('advance_description', '')),
                    'period_total': float(row.get('period_total', 0)),
                    'cumulative_total': float(row.get('cumulative_total', 0)),
                    'latest_amendment_flag': bool(row.get('latest_amendment_flag', True))
                }
                results.append(filing_data)

            total_count = len(results)
            total_pages = (total_count + pagination['pageSize'] - 1) // pagination['pageSize']

            response_data = {
                'data': results,
                'pagination': {
                    'currentPage': pagination['page'],
                    'totalPages': max(1, total_pages),
                    'totalCount': total_count,
                    'pageSize': pagination['pageSize'],
                    'hasNextPage': pagination['page'] < total_pages,
                    'hasPreviousPage': pagination['page'] > 1
                }
            }

            return jsonify({
                'success': True,
                'data': response_data
            }), 200

        except Exception as e:
            current_app.logger.error(f"Financial search BigQuery error: {str(e)}")
            return get_mock_search_results('financial', params, pagination)

    except Exception as e:
        current_app.logger.error(f"Financial search error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to execute financial search'
        }), 500

@bp.route('/filings', methods=['POST'])
@jwt_required(optional=True)
def search_filings():
    """Search for filing records"""
    try:
        data = request.get_json() or {}
        params = data.get('params', {})
        pagination = data.get('pagination', {'page': 1, 'pageSize': 25})

        # Validate pagination
        pagination['page'] = max(1, pagination.get('page', 1))
        pagination['pageSize'] = min(100, max(1, pagination.get('pageSize', 25)))

        if not current_app.bigquery_client:
            return get_mock_search_results('filings', params, pagination)

        # Build and execute query
        query = build_filing_search_query(params, pagination)

        try:
            result_df = current_app.bigquery_client.query(query).to_dataframe()

            # Process results
            results = []
            for _, row in result_df.iterrows():
                filing_data = {
                    'filing_id': str(row.get('filing_id', '')),
                    'filer_name': str(row.get('filer_name', '')),
                    'firm_name': str(row.get('firm_name', '')),
                    'employer_name': str(row.get('employer_name', '')),
                    'report_date': row.get('report_date').strftime('%Y-%m-%d') if row.get('report_date') else '',
                    'from_date': row.get('from_date').strftime('%Y-%m-%d') if row.get('from_date') else '',
                    'thru_date': row.get('thru_date').strftime('%Y-%m-%d') if row.get('thru_date') else '',
                    'total_amount': float(row.get('total_amount', 0)),
                    'county': str(row.get('county', '')),
                    'city': str(row.get('city', '')),
                    'status': str(row.get('status', 'Active')),
                    'amendment_id': int(row.get('amendment_id', 0)),
                    'line_item': str(row.get('line_item', '')),
                    'fees_amount': float(row.get('fees_amount', 0)),
                    'reimbursement_amount': float(row.get('reimbursement_amount', 0)),
                    'advance_amount': float(row.get('advance_amount', 0)),
                    'advance_description': str(row.get('advance_description', '')),
                    'period_total': float(row.get('period_total', 0)),
                    'cumulative_total': float(row.get('cumulative_total', 0)),
                    'latest_amendment_flag': bool(row.get('latest_amendment_flag', True))
                }
                results.append(filing_data)

            total_count = len(results)
            total_pages = (total_count + pagination['pageSize'] - 1) // pagination['pageSize']

            response_data = {
                'data': results,
                'pagination': {
                    'currentPage': pagination['page'],
                    'totalPages': max(1, total_pages),
                    'totalCount': total_count,
                    'pageSize': pagination['pageSize'],
                    'hasNextPage': pagination['page'] < total_pages,
                    'hasPreviousPage': pagination['page'] > 1
                }
            }

            return jsonify({
                'success': True,
                'data': response_data
            }), 200

        except Exception as e:
            current_app.logger.error(f"Filing search BigQuery error: {str(e)}")
            return get_mock_search_results('filings', params, pagination)

    except Exception as e:
        current_app.logger.error(f"Filing search error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to execute filing search'
        }), 500

def get_mock_search_results(search_type, params, pagination):
    """Generate mock search results for development/demo"""
    mock_results = []

    # Generate mock data based on search type
    for i in range(pagination['pageSize']):
        base_id = (pagination['page'] - 1) * pagination['pageSize'] + i + 1

        mock_filing = {
            'filing_id': f'10{100000 + base_id}',
            'filer_name': f'Sample Lobbyist {base_id}',
            'firm_name': f'Sample Firm {base_id}',
            'employer_name': f'Sample Employer {base_id}',
            'report_date': '2024-09-01',
            'from_date': '2024-07-01',
            'thru_date': '2024-09-30',
            'total_amount': float(10000 + (base_id * 1500)),
            'county': 'Sacramento',
            'city': 'Sacramento',
            'status': 'Active',
            'amendment_id': 0,
            'line_item': f'L{base_id}',
            'fees_amount': float(8000 + (base_id * 1000)),
            'reimbursement_amount': float(1000 + (base_id * 300)),
            'advance_amount': float(1000 + (base_id * 200)),
            'advance_description': f'Travel and accommodation expenses {base_id}',
            'period_total': float(10000 + (base_id * 1500)),
            'cumulative_total': float(30000 + (base_id * 4500)),
            'latest_amendment_flag': True
        }
        mock_results.append(mock_filing)

    # Mock pagination
    total_count = 1000  # Mock total
    total_pages = (total_count + pagination['pageSize'] - 1) // pagination['pageSize']

    response_data = {
        'data': mock_results,
        'pagination': {
            'currentPage': pagination['page'],
            'totalPages': total_pages,
            'totalCount': total_count,
            'pageSize': pagination['pageSize'],
            'hasNextPage': pagination['page'] < total_pages,
            'hasPreviousPage': pagination['page'] > 1
        }
    }

    return jsonify({
        'success': True,
        'data': response_data,
        'mock': True
    }), 200