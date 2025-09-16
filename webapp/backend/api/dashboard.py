"""
Dashboard API endpoints
Provides statistics and activity data for the main dashboard
"""
from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, timedelta
import json

bp = Blueprint('dashboard', __name__)

def get_cached_stats():
    """Get cached dashboard stats from Redis"""
    if not current_app.redis_client:
        return None

    try:
        cached_data = current_app.redis_client.get('dashboard_stats')
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        current_app.logger.warning(f"Failed to get cached stats: {e}")

    return None

def cache_stats(stats_data, ttl=900):  # Cache for 15 minutes
    """Cache dashboard stats in Redis"""
    if not current_app.redis_client:
        return

    try:
        current_app.redis_client.setex(
            'dashboard_stats',
            ttl,
            json.dumps(stats_data, default=str)
        )
    except Exception as e:
        current_app.logger.warning(f"Failed to cache stats: {e}")

def execute_bigquery_stats():
    """Execute BigQuery queries to get dashboard statistics"""
    if not current_app.bigquery_client:
        return generate_mock_stats()

    try:
        # Query for total filings
        total_filings_query = """
        SELECT COUNT(DISTINCT filing_id) as total_filings
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
        WHERE rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        """

        # Query for total payments
        total_payments_query = """
        SELECT
            SUM(CAST(fees_amt AS FLOAT64)) +
            SUM(CAST(reimb_amt AS FLOAT64)) +
            SUM(CAST(advan_amt AS FLOAT64)) as total_payments
        FROM `ca-lobby.ca_lobby.lpay_cd`
        WHERE filing_id IN (
            SELECT DISTINCT filing_id
            FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
            WHERE rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        )
        """

        # Query for active lobbyists
        active_lobbyists_query = """
        SELECT COUNT(DISTINCT filer_naml) as active_lobbyists
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
        WHERE rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        """

        # Query for latest period
        latest_period_query = """
        SELECT MAX(rpt_date) as latest_period
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
        """

        # Execute queries
        total_filings_result = current_app.bigquery_client.query(total_filings_query).to_dataframe()
        total_payments_result = current_app.bigquery_client.query(total_payments_query).to_dataframe()
        active_lobbyists_result = current_app.bigquery_client.query(active_lobbyists_query).to_dataframe()
        latest_period_result = current_app.bigquery_client.query(latest_period_query).to_dataframe()

        # Recent activity query
        recent_activity_query = """
        SELECT
            filing_id,
            filer_naml,
            firm_name,
            rpt_date,
            amend_id,
            'Filing' as activity_type
        FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
        WHERE rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        ORDER BY rpt_date DESC, amend_id DESC
        LIMIT 10
        """

        recent_activity_result = current_app.bigquery_client.query(recent_activity_query).to_dataframe()

        # Process results
        stats = {
            'totalFilings': int(total_filings_result.iloc[0]['total_filings']) if not total_filings_result.empty else 0,
            'totalPayments': float(total_payments_result.iloc[0]['total_payments'] or 0) if not total_payments_result.empty else 0,
            'activeLobbyists': int(active_lobbyists_result.iloc[0]['active_lobbyists']) if not active_lobbyists_result.empty else 0,
            'latestPeriod': latest_period_result.iloc[0]['latest_period'].strftime('%Y-%m-%d') if not latest_period_result.empty else 'N/A',
            'recentActivity': []
        }

        # Process recent activity
        for _, row in recent_activity_result.iterrows():
            activity = {
                'id': f"{row['filing_id']}_{row['amend_id']}",
                'type': determine_activity_type(row['amend_id']),
                'description': f"Filing by {row['filer_naml']}" + (f" ({row['firm_name']})" if row['firm_name'] else ""),
                'timestamp': row['rpt_date'].isoformat() if hasattr(row['rpt_date'], 'isoformat') else str(row['rpt_date']),
                'filingId': row['filing_id']
            }
            stats['recentActivity'].append(activity)

        return stats

    except Exception as e:
        current_app.logger.error(f"BigQuery stats error: {e}")
        return generate_mock_stats()

def determine_activity_type(amend_id):
    """Determine activity type based on amendment ID"""
    if amend_id == 0:
        return 'Filing'
    else:
        return 'Amendment'

def generate_mock_stats():
    """Generate mock statistics for development/demo purposes"""
    base_date = datetime.now()

    mock_activities = []
    activity_types = ['Filing', 'Amendment', 'Registration']
    filers = [
        'Sacramento Advocacy Group',
        'Golden State Lobbyists',
        'Capitol Consultants',
        'Bay Area Government Relations',
        'Central Valley Public Affairs'
    ]

    for i in range(8):
        activity_date = base_date - timedelta(days=i * 2, hours=i * 3)
        activity = {
            'id': f'activity_{i}',
            'type': activity_types[i % len(activity_types)],
            'description': f"New {activity_types[i % len(activity_types)].lower()} by {filers[i % len(filers)]}",
            'timestamp': activity_date.isoformat(),
            'filingId': f'10{100000 + i}'
        }
        mock_activities.append(activity)

    return {
        'totalFilings': 15420,
        'totalPayments': 45670000,  # $45.67M
        'activeLobbyists': 1247,
        'latestPeriod': '2024-Q3',
        'recentActivity': mock_activities
    }

@bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Try to get cached stats first
        cached_stats = get_cached_stats()
        if cached_stats:
            return jsonify({
                'success': True,
                'data': cached_stats,
                'cached': True
            }), 200

        # Generate fresh stats
        stats = execute_bigquery_stats()

        # Cache the results
        cache_stats(stats)

        return jsonify({
            'success': True,
            'data': stats,
            'cached': False
        }), 200

    except Exception as e:
        current_app.logger.error(f"Dashboard stats error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load dashboard statistics'
        }), 500

@bp.route('/activity', methods=['GET'])
@jwt_required(optional=True)  # Optional JWT for public access
def get_recent_activity():
    """Get detailed recent activity feed"""
    try:
        # Get user info if authenticated
        user_role = 'GUEST'
        if get_jwt():
            claims = get_jwt()
            user_role = claims.get('role', 'GUEST')

        # Determine activity limit based on user role
        activity_limits = {
            'GUEST': 5,
            'PUBLIC': 10,
            'RESEARCHER': 25,
            'JOURNALIST': 25,
            'ADMIN': 50
        }

        limit = activity_limits.get(user_role, 5)

        if current_app.bigquery_client:
            # Query recent activity from BigQuery
            activity_query = f"""
            SELECT
                filing_id,
                filer_naml,
                firm_name,
                emplr_naml,
                rpt_date,
                amend_id,
                from_date,
                thru_date
            FROM `ca-lobby.ca_lobby.cvr_lobby_disclosure_cd`
            WHERE rpt_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 60 DAY)
            ORDER BY rpt_date DESC, amend_id DESC
            LIMIT {limit}
            """

            result = current_app.bigquery_client.query(activity_query).to_dataframe()

            activities = []
            for _, row in result.iterrows():
                activity = {
                    'id': f"{row['filing_id']}_{row['amend_id']}",
                    'type': determine_activity_type(row['amend_id']),
                    'description': create_activity_description(row),
                    'timestamp': row['rpt_date'].isoformat() if hasattr(row['rpt_date'], 'isoformat') else str(row['rpt_date']),
                    'filingId': row['filing_id'],
                    'details': {
                        'filer': row['filer_naml'],
                        'firm': row.get('firm_name'),
                        'employer': row.get('emplr_naml'),
                        'period': f"{row['from_date']} to {row['thru_date']}" if row.get('from_date') and row.get('thru_date') else None
                    }
                }
                activities.append(activity)

        else:
            # Use mock data
            stats = generate_mock_stats()
            activities = stats['recentActivity'][:limit]

        return jsonify({
            'success': True,
            'data': activities
        }), 200

    except Exception as e:
        current_app.logger.error(f"Recent activity error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load recent activity'
        }), 500

def create_activity_description(row):
    """Create a human-readable description for an activity"""
    filer = row['filer_naml']
    firm = row.get('firm_name')
    employer = row.get('emplr_naml')
    amend_id = row.get('amend_id', 0)

    if amend_id == 0:
        action = "filed a new disclosure"
    else:
        action = f"submitted amendment #{amend_id}"

    description = f"{filer} {action}"

    if firm and firm != filer:
        description += f" representing {firm}"

    if employer and employer not in [filer, firm]:
        description += f" for {employer}"

    return description

@bp.route('/summary', methods=['GET'])
@jwt_required(optional=True)
def get_dashboard_summary():
    """Get a comprehensive dashboard summary"""
    try:
        # Get basic stats
        stats = execute_bigquery_stats()

        # Add additional summary information
        summary = {
            **stats,
            'lastUpdated': datetime.utcnow().isoformat(),
            'dataSource': 'California Secretary of State',
            'coveragePeriod': '2020 - Present',
            'updateFrequency': 'Daily',
            'systemStatus': 'Operational'
        }

        # Add user-specific information if authenticated
        if get_jwt():
            claims = get_jwt()
            user_role = claims.get('role', 'GUEST')

            # Add role-specific capabilities
            role_capabilities = {
                'GUEST': ['Basic data viewing', 'Simple searches'],
                'PUBLIC': ['Advanced searches', 'Limited exports (1,000 rows)'],
                'RESEARCHER': ['Custom reports', 'Unlimited exports', 'Full data access'],
                'JOURNALIST': ['Bulk downloads', 'All researcher features'],
                'ADMIN': ['User management', 'System administration', 'All features']
            }

            summary['userRole'] = user_role
            summary['capabilities'] = role_capabilities.get(user_role, [])

        return jsonify({
            'success': True,
            'data': summary
        }), 200

    except Exception as e:
        current_app.logger.error(f"Dashboard summary error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load dashboard summary'
        }), 500