"""
Authentication API endpoints
Handles user login, logout, and token management
"""
import logging
from flask import Blueprint, request, jsonify, current_app, g
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import uuid

# Create logger for this module
logger = logging.getLogger('ca_lobby_app.auth')

bp = Blueprint('auth', __name__)

# Mock user database - In production, this would be a proper database
MOCK_USERS = {
    'guest@ca-lobby.gov': {
        'id': str(uuid.uuid4()),
        'email': 'guest@ca-lobby.gov',
        'name': 'Guest User',
        'password_hash': generate_password_hash('guest'),
        'role': 'GUEST',
        'is_active': True,
        'last_login': None,
    },
    'public@ca-lobby.gov': {
        'id': str(uuid.uuid4()),
        'email': 'public@ca-lobby.gov',
        'name': 'Public User',
        'password_hash': generate_password_hash('public123'),
        'role': 'PUBLIC',
        'is_active': True,
        'last_login': None,
    },
    'researcher@ca-lobby.gov': {
        'id': str(uuid.uuid4()),
        'email': 'researcher@ca-lobby.gov',
        'name': 'Research Analyst',
        'password_hash': generate_password_hash('research123'),
        'role': 'RESEARCHER',
        'is_active': True,
        'last_login': None,
    },
    'journalist@ca-lobby.gov': {
        'id': str(uuid.uuid4()),
        'email': 'journalist@ca-lobby.gov',
        'name': 'Investigative Journalist',
        'password_hash': generate_password_hash('journalist123'),
        'role': 'JOURNALIST',
        'is_active': True,
        'last_login': None,
    },
    'admin@ca-lobby.gov': {
        'id': str(uuid.uuid4()),
        'email': 'admin@ca-lobby.gov',
        'name': 'System Administrator',
        'password_hash': generate_password_hash('admin123'),
        'role': 'ADMIN',
        'is_active': True,
        'last_login': None,
    }
}

def get_user_by_email(email):
    """Get user by email address"""
    return MOCK_USERS.get(email)

def update_last_login(email):
    """Update user's last login time"""
    if email in MOCK_USERS:
        MOCK_USERS[email]['last_login'] = datetime.utcnow()

@bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    request_id = getattr(g, 'request_id', 'unknown')
    logger.info(f"🔐 Login attempt initiated - IP: {request.remote_addr}")

    try:
        data = request.get_json()

        if not data:
            logger.warning(f"❌ Login failed - No request body provided")
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400

        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        role = data.get('role', 'PUBLIC')

        logger.info(f"🔍 Login attempt for email: {email} with role: {role}")

        if not email or not password:
            logger.warning(f"❌ Login failed - Missing credentials for email: {email}")
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400

        # Get user from mock database
        user = get_user_by_email(email)

        if not user:
            logger.warning(f"❌ Login failed - User not found: {email}")
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401

        # Check password
        if not check_password_hash(user['password_hash'], password):
            logger.warning(f"❌ Login failed - Invalid password for user: {email}")
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401

        # Check if user is active
        if not user.get('is_active', False):
            logger.warning(f"❌ Login failed - Account deactivated: {email}")
            return jsonify({
                'success': False,
                'message': 'Account is deactivated'
            }), 403

        # Verify role matches (for role-based login)
        if user['role'] != role:
            logger.warning(f"❌ Login failed - Role mismatch for {email}: expected {role}, user has {user['role']}")
            return jsonify({
                'success': False,
                'message': 'Invalid role for this account'
            }), 403

        # Update last login
        update_last_login(email)
        logger.debug(f"📅 Updated last login time for user: {email}")

        # Create access token
        access_token = create_access_token(
            identity=user['id'],
            additional_claims={
                'email': user['email'],
                'role': user['role'],
                'name': user['name']
            }
        )

        logger.info(f"🎫 JWT token created for user: {email} with role: {user['role']}")

        # Return user data and token
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'isActive': user['is_active'],
            'lastLogin': user['last_login'].isoformat() if user['last_login'] else None
        }

        logger.info(f"✅ Login successful for user: {email} with role: {user['role']}")
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user_data,
                'token': access_token
            }
        }), 200

    except Exception as e:
        logger.error(f"💥 Login error for IP {request.remote_addr}: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout endpoint - blacklists the current token"""
    logger.info(f"🚪 Logout request initiated - IP: {request.remote_addr}")

    try:
        claims = get_jwt()
        jti = claims['jti']
        user_email = claims.get('email', 'unknown')

        logger.info(f"🔓 Processing logout for user: {user_email}")

        # Add token to blacklist in Redis if available
        if current_app.redis_client:
            # Set token in Redis with expiration matching JWT expiration
            current_app.redis_client.set(
                jti,
                'blacklisted',
                ex=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
            )
            logger.info(f"🚫 Token blacklisted in Redis for user: {user_email} - JTI: {jti[:8]}...")
        else:
            logger.warning(f"⚠️ Redis not available - token not blacklisted for user: {user_email}")

        logger.info(f"✅ Logout successful for user: {user_email}")
        return jsonify({
            'success': True,
            'message': 'Successfully logged out'
        }), 200

    except Exception as e:
        logger.error(f"💥 Logout error for IP {request.remote_addr}: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'An error occurred during logout'
        }), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    logger.debug(f"👤 Get current user request - IP: {request.remote_addr}")

    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        user_email = claims.get('email', 'unknown')

        logger.debug(f"🔍 Fetching user info for: {user_email}")

        # In a real application, you'd fetch this from a database
        user_data = {
            'id': user_id,
            'email': claims.get('email'),
            'name': claims.get('name'),
            'role': claims.get('role'),
            'isActive': True,
            'lastLogin': datetime.utcnow().isoformat()
        }

        logger.debug(f"✅ User info retrieved for: {user_email}")
        return jsonify({
            'success': True,
            'data': user_data
        }), 200

    except Exception as e:
        logger.error(f"💥 Get current user error for IP {request.remote_addr}: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to get user information'
        }), 500

@bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """Refresh access token"""
    logger.info(f"🔄 Token refresh request - IP: {request.remote_addr}")

    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        user_email = claims.get('email', 'unknown')
        old_jti = claims.get('jti', 'unknown')

        logger.info(f"🎫 Refreshing token for user: {user_email} - Old JTI: {old_jti[:8]}...")

        # Create new access token with same claims
        new_access_token = create_access_token(
            identity=current_user_id,
            additional_claims={
                'email': claims.get('email'),
                'role': claims.get('role'),
                'name': claims.get('name')
            }
        )

        logger.info(f"✅ New token created for user: {user_email}")
        return jsonify({
            'success': True,
            'data': {
                'token': new_access_token
            }
        }), 200

    except Exception as e:
        logger.error(f"💥 Token refresh error for IP {request.remote_addr}: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to refresh token'
        }), 500

@bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_token():
    """Validate current token"""
    logger.debug(f"🔍 Token validation request - IP: {request.remote_addr}")

    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        user_email = claims.get('email', 'unknown')
        jti = claims.get('jti', 'unknown')

        logger.debug(f"✅ Token validation successful for user: {user_email} - JTI: {jti[:8]}...")
        return jsonify({
            'success': True,
            'data': {
                'valid': True,
                'user_id': user_id,
                'role': claims.get('role'),
                'exp': claims.get('exp')
            }
        }), 200

    except Exception as e:
        logger.error(f"💥 Token validation error for IP {request.remote_addr}: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Token validation failed'
        }), 500

# Helper function to check user permissions
def has_permission(required_role=None, required_permission=None):
    """Decorator to check user permissions"""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            try:
                claims = get_jwt()
                user_role = claims.get('role', 'GUEST')

                # Role-based check
                if required_role and user_role != required_role:
                    return jsonify({
                        'success': False,
                        'message': 'Insufficient permissions'
                    }), 403

                # Permission-based check (implement based on your needs)
                if required_permission:
                    # Define role permissions
                    role_permissions = {
                        'GUEST': ['read_basic_data', 'run_simple_searches'],
                        'PUBLIC': ['read_basic_data', 'run_simple_searches', 'run_advanced_searches', 'export_limited'],
                        'RESEARCHER': ['read_all_data', 'run_custom_reports', 'export_unlimited'],
                        'JOURNALIST': ['read_all_data', 'run_custom_reports', 'export_unlimited', 'bulk_downloads'],
                        'ADMIN': ['full_access', 'user_management', 'system_settings']
                    }

                    user_permissions = role_permissions.get(user_role, [])
                    if required_permission not in user_permissions:
                        return jsonify({
                            'success': False,
                            'message': f'Permission {required_permission} required'
                        }), 403

                return f(*args, **kwargs)

            except Exception as e:
                logger.error(f"💥 Permission check error for IP {request.remote_addr}: {str(e)}", exc_info=True)
                return jsonify({
                    'success': False,
                    'message': 'Permission check failed'
                }), 500

        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator