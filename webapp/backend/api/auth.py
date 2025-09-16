"""
Authentication API endpoints
Handles user login, logout, and token management
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import uuid

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
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400

        email = data.get('email', '').lower().strip()
        password = data.get('password', '')
        role = data.get('role', 'PUBLIC')

        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400

        # Get user from mock database
        user = get_user_by_email(email)

        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401

        # Check password
        if not check_password_hash(user['password_hash'], password):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401

        # Check if user is active
        if not user.get('is_active', False):
            return jsonify({
                'success': False,
                'message': 'Account is deactivated'
            }), 403

        # Verify role matches (for role-based login)
        if user['role'] != role:
            return jsonify({
                'success': False,
                'message': 'Invalid role for this account'
            }), 403

        # Update last login
        update_last_login(email)

        # Create access token
        access_token = create_access_token(
            identity=user['id'],
            additional_claims={
                'email': user['email'],
                'role': user['role'],
                'name': user['name']
            }
        )

        # Return user data and token
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'isActive': user['is_active'],
            'lastLogin': user['last_login'].isoformat() if user['last_login'] else None
        }

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': user_data,
                'token': access_token
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout endpoint - blacklists the current token"""
    try:
        jti = get_jwt()['jti']

        # Add token to blacklist in Redis if available
        if current_app.redis_client:
            # Set token in Redis with expiration matching JWT expiration
            current_app.redis_client.set(
                jti,
                'blacklisted',
                ex=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
            )

        return jsonify({
            'success': True,
            'message': 'Successfully logged out'
        }), 200

    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during logout'
        }), 500

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

        # In a real application, you'd fetch this from a database
        user_data = {
            'id': user_id,
            'email': claims.get('email'),
            'name': claims.get('name'),
            'role': claims.get('role'),
            'isActive': True,
            'lastLogin': datetime.utcnow().isoformat()
        }

        return jsonify({
            'success': True,
            'data': user_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Get current user error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to get user information'
        }), 500

@bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """Refresh access token"""
    try:
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        # Create new access token with same claims
        new_access_token = create_access_token(
            identity=current_user_id,
            additional_claims={
                'email': claims.get('email'),
                'role': claims.get('role'),
                'name': claims.get('name')
            }
        )

        return jsonify({
            'success': True,
            'data': {
                'token': new_access_token
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to refresh token'
        }), 500

@bp.route('/validate', methods=['POST'])
@jwt_required()
def validate_token():
    """Validate current token"""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

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
        current_app.logger.error(f"Token validation error: {str(e)}")
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
                current_app.logger.error(f"Permission check error: {str(e)}")
                return jsonify({
                    'success': False,
                    'message': 'Permission check failed'
                }), 500

        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator