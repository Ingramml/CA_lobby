"""
Admin API endpoints
Handles user management and system administration
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime, timedelta
import json

bp = Blueprint('admin', __name__)

def require_admin():
    """Decorator to ensure admin permissions"""
    claims = get_jwt()
    user_role = claims.get('role', 'PUBLIC')

    if user_role != 'ADMIN':
        return jsonify({
            'success': False,
            'message': 'Administrator access required'
        }), 403

    return None

# Mock users data - in production this would be a database
MOCK_USERS_DB = {
    'user_1': {
        'id': 'user_1',
        'email': 'public@ca-lobby.gov',
        'name': 'Public User',
        'role': 'PUBLIC',
        'isActive': True,
        'lastLogin': '2024-09-15T10:30:00Z',
        'createdDate': '2024-01-15T09:00:00Z',
        'loginCount': 45
    },
    'user_2': {
        'id': 'user_2',
        'email': 'researcher@ca-lobby.gov',
        'name': 'Research Analyst',
        'role': 'RESEARCHER',
        'isActive': True,
        'lastLogin': '2024-09-16T08:15:00Z',
        'createdDate': '2024-02-01T14:20:00Z',
        'loginCount': 123
    },
    'user_3': {
        'id': 'user_3',
        'email': 'journalist@ca-lobby.gov',
        'name': 'Investigative Journalist',
        'role': 'JOURNALIST',
        'isActive': True,
        'lastLogin': '2024-09-14T16:45:00Z',
        'createdDate': '2024-03-10T11:30:00Z',
        'loginCount': 67
    },
    'user_4': {
        'id': 'user_4',
        'email': 'inactive@ca-lobby.gov',
        'name': 'Inactive User',
        'role': 'PUBLIC',
        'isActive': False,
        'lastLogin': '2024-08-20T12:00:00Z',
        'createdDate': '2024-01-05T10:00:00Z',
        'loginCount': 12
    }
}

@bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get list of users with pagination"""
    try:
        admin_check = require_admin()
        if admin_check:
            return admin_check

        page = max(1, int(request.args.get('page', 1)))
        page_size = min(100, max(1, int(request.args.get('pageSize', 25))))
        search = request.args.get('search', '').strip().lower()
        role_filter = request.args.get('role', '').upper()
        status_filter = request.args.get('status', '')  # 'active', 'inactive', or ''

        # Filter users
        users = list(MOCK_USERS_DB.values())

        if search:
            users = [u for u in users if search in u['name'].lower() or search in u['email'].lower()]

        if role_filter:
            users = [u for u in users if u['role'] == role_filter]

        if status_filter == 'active':
            users = [u for u in users if u['isActive']]
        elif status_filter == 'inactive':
            users = [u for u in users if not u['isActive']]

        # Sort by last login (most recent first)
        users.sort(key=lambda x: x.get('lastLogin', ''), reverse=True)

        # Pagination
        total_count = len(users)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_users = users[start_idx:end_idx]

        # Calculate pagination info
        total_pages = (total_count + page_size - 1) // page_size

        response_data = {
            'data': paginated_users,
            'pagination': {
                'currentPage': page,
                'totalPages': max(1, total_pages),
                'totalCount': total_count,
                'pageSize': page_size,
                'hasNextPage': page < total_pages,
                'hasPreviousPage': page > 1
            }
        }

        return jsonify({
            'success': True,
            'data': response_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get users error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load users'
        }), 500

@bp.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user information"""
    try:
        admin_check = require_admin()
        if admin_check:
            return admin_check

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Update data required'
            }), 400

        if user_id not in MOCK_USERS_DB:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        user = MOCK_USERS_DB[user_id]

        # Update allowed fields
        updatable_fields = ['name', 'role', 'isActive']
        for field in updatable_fields:
            if field in data:
                user[field] = data[field]

        # Validate role
        valid_roles = ['GUEST', 'PUBLIC', 'RESEARCHER', 'JOURNALIST', 'ADMIN']
        if 'role' in data and data['role'] not in valid_roles:
            return jsonify({
                'success': False,
                'message': f'Invalid role. Must be one of: {", ".join(valid_roles)}'
            }), 400

        user['updatedDate'] = datetime.utcnow().isoformat()

        return jsonify({
            'success': True,
            'data': user,
            'message': 'User updated successfully'
        }), 200

    except Exception as e:
        current_app.logger.error(f"Update user error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to update user'
        }), 500

@bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete/deactivate user"""
    try:
        admin_check = require_admin()
        if admin_check:
            return admin_check

        if user_id not in MOCK_USERS_DB:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        # Don't actually delete, just deactivate
        MOCK_USERS_DB[user_id]['isActive'] = False
        MOCK_USERS_DB[user_id]['deactivatedDate'] = datetime.utcnow().isoformat()

        return jsonify({
            'success': True,
            'message': 'User deactivated successfully'
        }), 200

    except Exception as e:
        current_app.logger.error(f"Delete user error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to delete user'
        }), 500

@bp.route('/system/stats', methods=['GET'])
@jwt_required()
def get_system_stats():
    """Get system statistics and health"""
    try:
        admin_check = require_admin()
        if admin_check:
            return admin_check

        # Calculate user statistics
        users = list(MOCK_USERS_DB.values())
        active_users = len([u for u in users if u['isActive']])
        total_users = len(users)

        # Role distribution
        role_counts = {}
        for user in users:
            role = user['role']
            role_counts[role] = role_counts.get(role, 0) + 1

        # Recent activity (mock data)
        recent_logins = [u for u in users if u.get('lastLogin') and
                        datetime.fromisoformat(u['lastLogin'].replace('Z', '+00:00')) >
                        datetime.now().replace(tzinfo=None) - timedelta(days=7)]

        # System health checks
        system_health = {
            'database': current_app.bigquery_client is not None,
            'cache': current_app.redis_client is not None,
            'overall': 'healthy'
        }

        if not current_app.bigquery_client:
            system_health['overall'] = 'degraded'

        # Mock query statistics
        query_stats = {
            'totalQueries': 15847,
            'todayQueries': 234,
            'avgResponseTime': 0.45,
            'errorRate': 0.02
        }

        stats = {
            'users': {
                'total': total_users,
                'active': active_users,
                'inactive': total_users - active_users,
                'recentLogins': len(recent_logins),
                'roleDistribution': role_counts
            },
            'system': {
                'health': system_health,
                'uptime': '15d 8h 23m',  # Mock uptime
                'version': '1.0.0',
                'environment': 'production'
            },
            'queries': query_stats,
            'exports': {
                'totalExports': 1243,
                'todayExports': 23,
                'popularFormats': {
                    'CSV': 45,
                    'Excel': 30,
                    'JSON': 20,
                    'PDF': 5
                }
            }
        }

        return jsonify({
            'success': True,
            'data': stats
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get system stats error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to load system statistics'
        }), 500

@bp.route('/system/health', methods=['GET'])
@jwt_required()
def system_health_check():
    """Comprehensive system health check"""
    try:
        admin_check = require_admin()
        if admin_check:
            return admin_check

        health_checks = {}

        # BigQuery connection
        try:
            if current_app.bigquery_client:
                # Try a simple query to test connection
                test_query = "SELECT 1 as test_connection LIMIT 1"
                result = current_app.bigquery_client.query(test_query).to_dataframe()
                health_checks['bigquery'] = {
                    'status': 'healthy',
                    'response_time': 0.15,  # Mock response time
                    'last_check': datetime.utcnow().isoformat()
                }
            else:
                health_checks['bigquery'] = {
                    'status': 'unavailable',
                    'error': 'Client not initialized',
                    'last_check': datetime.utcnow().isoformat()
                }
        except Exception as e:
            health_checks['bigquery'] = {
                'status': 'error',
                'error': str(e),
                'last_check': datetime.utcnow().isoformat()
            }

        # Redis connection
        try:
            if current_app.redis_client:
                current_app.redis_client.ping()
                health_checks['redis'] = {
                    'status': 'healthy',
                    'response_time': 0.05,
                    'last_check': datetime.utcnow().isoformat()
                }
            else:
                health_checks['redis'] = {
                    'status': 'unavailable',
                    'error': 'Client not initialized',
                    'last_check': datetime.utcnow().isoformat()
                }
        except Exception as e:
            health_checks['redis'] = {
                'status': 'error',
                'error': str(e),
                'last_check': datetime.utcnow().isoformat()
            }

        # Overall system status
        all_healthy = all(check['status'] == 'healthy' for check in health_checks.values())
        any_error = any(check['status'] == 'error' for check in health_checks.values())

        if all_healthy:
            overall_status = 'healthy'
        elif any_error:
            overall_status = 'error'
        else:
            overall_status = 'degraded'

        health_report = {
            'overall_status': overall_status,
            'timestamp': datetime.utcnow().isoformat(),
            'services': health_checks,
            'recommendations': []
        }

        # Add recommendations based on health status
        if health_checks.get('bigquery', {}).get('status') != 'healthy':
            health_report['recommendations'].append('Check BigQuery connection and credentials')

        if health_checks.get('redis', {}).get('status') != 'healthy':
            health_report['recommendations'].append('Verify Redis server is running and accessible')

        status_code = 200 if overall_status == 'healthy' else 503

        return jsonify({
            'success': True,
            'data': health_report
        }), status_code

    except Exception as e:
        current_app.logger.error(f"System health check error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Health check failed'
        }), 500

@bp.route('/logs', methods=['GET'])
@jwt_required()
def get_system_logs():
    """Get system logs (mock implementation)"""
    try:
        admin_check = require_admin()
        if admin_check:
            return admin_check

        # Mock log entries
        logs = [
            {
                'timestamp': '2024-09-16T12:00:00Z',
                'level': 'INFO',
                'message': 'User researcher@ca-lobby.gov logged in',
                'source': 'auth'
            },
            {
                'timestamp': '2024-09-16T11:58:30Z',
                'level': 'INFO',
                'message': 'Generated financial analysis report',
                'source': 'reports'
            },
            {
                'timestamp': '2024-09-16T11:55:15Z',
                'level': 'WARNING',
                'message': 'High query volume detected',
                'source': 'bigquery'
            },
            {
                'timestamp': '2024-09-16T11:52:00Z',
                'level': 'INFO',
                'message': 'Export CSV requested by journalist@ca-lobby.gov',
                'source': 'export'
            },
            {
                'timestamp': '2024-09-16T11:50:22Z',
                'level': 'ERROR',
                'message': 'Redis connection temporarily lost',
                'source': 'cache'
            }
        ]

        return jsonify({
            'success': True,
            'data': logs
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get system logs error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve logs'
        }), 500

@bp.route('/settings', methods=['GET'])
@jwt_required()
def get_system_settings():
    """Get system configuration settings"""
    try:
        admin_check = require_admin()
        if admin_check:
            return admin_check

        # Mock system settings
        settings = {
            'general': {
                'siteName': 'California Lobbying Transparency Portal',
                'version': '1.0.0',
                'environment': 'production',
                'maintenanceMode': False
            },
            'database': {
                'bigqueryProject': 'ca-lobby',
                'bigqueryDataset': 'ca_lobby',
                'connectionTimeout': 30,
                'queryTimeout': 300
            },
            'cache': {
                'redisEnabled': True,
                'defaultTtl': 900,  # 15 minutes
                'maxMemory': '512mb'
            },
            'security': {
                'jwtExpiration': 28800,  # 8 hours
                'maxLoginAttempts': 5,
                'sessionTimeout': 3600  # 1 hour
            },
            'exports': {
                'maxFileSize': 50,  # MB
                'retentionDays': 7,
                'allowedFormats': ['CSV', 'JSON', 'Excel', 'PDF']
            }
        }

        return jsonify({
            'success': True,
            'data': settings
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get system settings error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve settings'
        }), 500

@bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_system_settings():
    """Update system settings"""
    try:
        admin_check = require_admin()
        if admin_check:
            return admin_check

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Settings data required'
            }), 400

        # In a real implementation, this would update configuration
        # For now, just return success
        return jsonify({
            'success': True,
            'message': 'Settings updated successfully',
            'data': data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Update system settings error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to update settings'
        }), 500