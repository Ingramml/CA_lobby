"""
California Lobbying Transparency Web API
Main Flask application with BigQuery integration
"""
import os
import sys
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import redis
import json
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Add the parent directory to path to import existing modules
sys.path.append('/Users/michaelingram/Documents/GitHub/CA_lobby')
try:
    from data_processing.Bigquery_connection import bigquery_connect, get_project_id_from_credentials
    from data_processing.rowtypeforce import row_type_force
    BIGQUERY_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import BigQuery modules: {e}")
    print("Running in mock data mode")
    BIGQUERY_AVAILABLE = False

# Import API modules
from api import auth, dashboard, search, reports, data, export, admin

# Load environment variables
load_dotenv()

def create_app(config_name='development'):
    app = Flask(__name__)

    # Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access']
    app.config['BIGQUERY_CREDENTIALS_PATH'] = os.getenv('CREDENTIALS_LOCATION')
    app.config['BIGQUERY_PROJECT_ID'] = os.getenv('PROJECT_ID')
    app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    # Initialize extensions
    # Configure CORS for both development and production
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(',')
    CORS(app, origins=cors_origins)
    jwt = JWTManager(app)

    # Initialize Redis for token blacklisting and caching
    try:
        redis_client = redis.from_url(app.config['REDIS_URL'])
        app.redis_client = redis_client
    except Exception as e:
        print(f"Warning: Could not connect to Redis: {e}")
        app.redis_client = None

    # Initialize BigQuery connection
    try:
        bigquery_client = bigquery_connect(app.config['BIGQUERY_CREDENTIALS_PATH'])
        app.bigquery_client = bigquery_client
        print("✅ BigQuery client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize BigQuery client: {e}")
        app.bigquery_client = None

    # JWT token blacklist checker
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        if app.redis_client:
            jti = jwt_payload['jti']
            token_in_redis = app.redis_client.get(jti)
            return token_in_redis is not None
        return False

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'message': 'Authorization token is required'}), 401

    # Register blueprints
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard.bp, url_prefix='/api/dashboard')
    app.register_blueprint(search.bp, url_prefix='/api/search')
    app.register_blueprint(reports.bp, url_prefix='/api/reports')
    app.register_blueprint(data.bp, url_prefix='/api/data')
    app.register_blueprint(export.bp, url_prefix='/api/export')
    app.register_blueprint(admin.bp, url_prefix='/api/admin')

    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'services': {
                'bigquery': app.bigquery_client is not None,
                'redis': app.redis_client is not None if app.redis_client else False,
            }
        }

        status_code = 200
        if not app.bigquery_client:
            health_status['status'] = 'degraded'
            status_code = 503

        return jsonify(health_status), status_code

    # Root endpoint
    @app.route('/api/')
    def api_root():
        return jsonify({
            'message': 'California Lobbying Transparency API',
            'version': '1.0.0',
            'documentation': '/api/docs',
            'endpoints': {
                'auth': '/api/auth/',
                'dashboard': '/api/dashboard/',
                'search': '/api/search/',
                'reports': '/api/reports/',
                'data': '/api/data/',
                'export': '/api/export/',
                'admin': '/api/admin/',
                'health': '/api/health'
            }
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400

    return app

if __name__ == '__main__':
    app = create_app()

    # Development server settings
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    port = int(os.getenv('PORT', 5000))

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode,
        threaded=True
    )