"""
California Lobbying Transparency Web API
Main Flask application with BigQuery integration
"""
import os
import sys
import logging
import uuid
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file, g
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import redis
import json
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Add the parent directory to path to import existing modules
import os
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
sys.path.append(project_root)
try:
    from data_processing.Bigquery_connection import bigquery_connect, get_project_id_from_credentials
    from data_processing.rowtypeforce import row_type_force
    BIGQUERY_AVAILABLE = True
    print("✅ BigQuery modules imported successfully")
except ImportError as e:
    print(f"⚠️ Could not import BigQuery modules: {e}")
    print("Running in mock data mode")
    BIGQUERY_AVAILABLE = False

# Import API modules
from api import auth, dashboard, search, reports, data, export, admin

# Load environment variables
load_dotenv()

# Configure logging
def setup_logging():
    """Configure structured logging for the application"""
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()

    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level, logging.INFO))

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create console handler for Vercel
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Create app logger
    app_logger = logging.getLogger('ca_lobby_app')
    app_logger.setLevel(getattr(logging, log_level, logging.INFO))

    return app_logger

# Initialize logging
logger = setup_logging()

def create_app(config_name='development'):
    app = Flask(__name__)

    # Setup request ID for logging correlation
    @app.before_request
    def before_request():
        g.request_id = str(uuid.uuid4())[:8]

        # Add custom formatter filter to include request ID
        old_factory = logging.getLogRecordFactory()
        def record_factory(*args, **kwargs):
            record = old_factory(*args, **kwargs)
            record.request_id = getattr(g, 'request_id', 'no-request')
            return record
        logging.setLogRecordFactory(record_factory)

        # Log incoming request
        logger.info(f"🔄 {request.method} {request.path} - Remote IP: {request.remote_addr} - User Agent: {request.headers.get('User-Agent', 'Unknown')}")
        if request.args:
            logger.debug(f"📥 Query parameters: {dict(request.args)}")

    @app.after_request
    def after_request(response):
        # Log response
        logger.info(f"✅ {request.method} {request.path} - Status: {response.status_code} - Size: {response.content_length or 0} bytes")
        return response

    logger.info(f"🚀 Starting CA Lobby App - Config: {config_name}")
    logger.info(f"🔧 Environment: {os.getenv('FLASK_ENV', 'production')}")
    logger.info(f"🔧 Python version: {sys.version}")

    # Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access']
    app.config['BIGQUERY_CREDENTIALS_PATH'] = os.getenv('CREDENTIALS_LOCATION')
    app.config['BIGQUERY_PROJECT_ID'] = os.getenv('PROJECT_ID')
    app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    # Log configuration (safely, without secrets)
    logger.info("📋 Application Configuration:")
    logger.info(f"  - JWT token expires: {app.config['JWT_ACCESS_TOKEN_EXPIRES']}")
    logger.info(f"  - BigQuery project ID: {app.config['BIGQUERY_PROJECT_ID']}")
    logger.info(f"  - Redis URL: {app.config['REDIS_URL'].split('@')[0] if '@' in app.config['REDIS_URL'] else app.config['REDIS_URL']}")  # Hide credentials
    logger.info(f"  - BigQuery available: {BIGQUERY_AVAILABLE}")
    logger.info(f"  - Mock data mode: {os.getenv('USE_MOCK_DATA', 'false')}")
    logger.info(f"  - Log level: {os.getenv('LOG_LEVEL', 'INFO')}")

    # Log environment variables (safely)
    important_env_vars = ['FLASK_ENV', 'VERCEL_URL', 'CORS_ORIGINS', 'USE_MOCK_DATA', 'LOG_LEVEL']
    logger.info("🌍 Environment Variables:")
    for var in important_env_vars:
        value = os.getenv(var, 'Not Set')
        logger.info(f"  - {var}: {value}")

    # Initialize extensions
    # Configure CORS for both development and production
    logger.info("🔗 Configuring CORS...")
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(',')
    logger.info(f"📝 Base CORS origins: {cors_origins}")

    # For demo mode, allow all origins from Vercel (or specific domain if provided)
    if os.getenv('USE_MOCK_DATA') == 'true':
        logger.info("🎭 Running in demo mode - configuring permissive CORS")
        vercel_domain = os.getenv('VERCEL_URL')
        if vercel_domain:
            # If VERCEL_URL is provided, use it along with localhost for dev
            demo_origins = [f"https://{vercel_domain}", "http://localhost:3000", "http://localhost:3001"]
            logger.info(f"🌐 Demo CORS origins: {demo_origins}")
            CORS(app, origins=demo_origins, supports_credentials=False)
        else:
            # Fallback to allow all origins for demo
            logger.warning("⚠️ No VERCEL_URL set - allowing all origins for demo")
            CORS(app, origins=['*'], supports_credentials=False)
    else:
        logger.info(f"🔒 Production CORS origins: {cors_origins}")
        CORS(app, origins=cors_origins, supports_credentials=True)

    logger.info("✅ CORS configured successfully")

    logger.info("🔐 Initializing JWT Manager...")
    jwt = JWTManager(app)
    logger.info("✅ JWT Manager initialized")

    # Initialize Redis for token blacklisting and caching
    logger.info("🔴 Initializing Redis connection...")
    try:
        redis_client = redis.from_url(app.config['REDIS_URL'])
        # Test the connection
        redis_client.ping()
        app.redis_client = redis_client
        logger.info("✅ Redis connection established successfully")
        logger.info(f"📊 Redis info - DB: {redis_client.connection_pool.connection_kwargs.get('db', 0)}")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Redis: {e}")
        logger.warning("⚠️ Running without Redis - token blacklisting disabled")
        app.redis_client = None

    # Initialize BigQuery connection
    logger.info("📊 Initializing BigQuery connection...")
    if BIGQUERY_AVAILABLE:
        try:
            if app.config['BIGQUERY_CREDENTIALS_PATH']:
                logger.info(f"🔑 Using credentials from: {app.config['BIGQUERY_CREDENTIALS_PATH']}")
                bigquery_client = bigquery_connect(app.config['BIGQUERY_CREDENTIALS_PATH'])

                # Test the connection by trying to get project info
                project_id = bigquery_client.project
                logger.info(f"📈 BigQuery project ID: {project_id}")

                app.bigquery_client = bigquery_client
                logger.info("✅ BigQuery client initialized successfully")
            else:
                logger.error("❌ BIGQUERY_CREDENTIALS_PATH not set")
                app.bigquery_client = None
        except Exception as e:
            logger.error(f"❌ Failed to initialize BigQuery client: {e}")
            logger.error(f"🔍 Error type: {type(e).__name__}")
            app.bigquery_client = None
    else:
        logger.warning("⚠️ BigQuery modules not available - running in mock mode")
        app.bigquery_client = None

    # JWT token blacklist checker
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        if app.redis_client:
            jti = jwt_payload['jti']
            token_in_redis = app.redis_client.get(jti)
            is_revoked = token_in_redis is not None
            logger.debug(f"🔍 Token blacklist check - JTI: {jti[:8]}... - Revoked: {is_revoked}")
            return is_revoked
        logger.debug("⚠️ Redis not available - skipping token blacklist check")
        return False

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        logger.warning(f"⏰ Expired token access attempt - JTI: {jwt_payload.get('jti', 'unknown')[:8]}...")
        return jsonify({'message': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        logger.warning(f"❌ Invalid token access attempt - Error: {error}")
        return jsonify({'message': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        logger.warning(f"🚫 Unauthorized access attempt - No token provided - Path: {request.path}")
        return jsonify({'message': 'Authorization token is required'}), 401

    # Register blueprints
    logger.info("📦 Registering API blueprints...")
    blueprints = [
        (auth.bp, '/api/auth', 'Authentication'),
        (dashboard.bp, '/api/dashboard', 'Dashboard'),
        (search.bp, '/api/search', 'Search'),
        (reports.bp, '/api/reports', 'Reports'),
        (data.bp, '/api/data', 'Data'),
        (export.bp, '/api/export', 'Export'),
        (admin.bp, '/api/admin', 'Admin')
    ]

    for blueprint, prefix, name in blueprints:
        try:
            app.register_blueprint(blueprint, url_prefix=prefix)
            logger.info(f"  ✅ {name} blueprint registered at {prefix}")
        except Exception as e:
            logger.error(f"  ❌ Failed to register {name} blueprint: {e}")

    logger.info("✅ All blueprints registered successfully")

    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        logger.info("🩺 Health check requested")

        # Test service connections
        services = {}

        # BigQuery health
        bigquery_healthy = app.bigquery_client is not None
        if bigquery_healthy:
            try:
                # Test with a simple query
                project_id = app.bigquery_client.project
                services['bigquery'] = {
                    'status': 'healthy',
                    'project_id': project_id,
                    'available': True
                }
                logger.debug("✅ BigQuery health check passed")
            except Exception as e:
                services['bigquery'] = {
                    'status': 'unhealthy',
                    'error': str(e),
                    'available': False
                }
                bigquery_healthy = False
                logger.error(f"❌ BigQuery health check failed: {e}")
        else:
            services['bigquery'] = {
                'status': 'unavailable',
                'available': False,
                'reason': 'Not initialized or modules not available'
            }

        # Redis health
        redis_healthy = False
        if app.redis_client:
            try:
                app.redis_client.ping()
                services['redis'] = {
                    'status': 'healthy',
                    'available': True
                }
                redis_healthy = True
                logger.debug("✅ Redis health check passed")
            except Exception as e:
                services['redis'] = {
                    'status': 'unhealthy',
                    'error': str(e),
                    'available': False
                }
                logger.error(f"❌ Redis health check failed: {e}")
        else:
            services['redis'] = {
                'status': 'unavailable',
                'available': False,
                'reason': 'Not initialized'
            }

        # Overall status
        overall_status = 'healthy'
        status_code = 200

        if not bigquery_healthy and not os.getenv('USE_MOCK_DATA') == 'true':
            overall_status = 'unhealthy'
            status_code = 503
        elif not bigquery_healthy:
            overall_status = 'degraded'
            status_code = 200  # OK for demo mode

        health_status = {
            'status': overall_status,
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0',
            'environment': {
                'flask_env': os.getenv('FLASK_ENV', 'production'),
                'mock_data_mode': os.getenv('USE_MOCK_DATA', 'false') == 'true',
                'vercel_url': os.getenv('VERCEL_URL', 'Not set'),
                'python_version': sys.version.split()[0]
            },
            'services': services,
            'features': {
                'authentication': True,
                'bigquery_available': BIGQUERY_AVAILABLE,
                'token_blacklisting': app.redis_client is not None
            }
        }

        logger.info(f"🩺 Health check completed - Status: {overall_status}")
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
        logger.warning(f"🔍 404 Not Found - Path: {request.path} - Method: {request.method} - IP: {request.remote_addr}")
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"💥 500 Internal Server Error - Path: {request.path} - Method: {request.method} - Error: {error}")
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(400)
    def bad_request(error):
        logger.warning(f"❌ 400 Bad Request - Path: {request.path} - Method: {request.method} - Error: {error}")
        return jsonify({'error': 'Bad request'}), 400

    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.error(f"💥 Unhandled Exception - Path: {request.path} - Method: {request.method} - Error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

    logger.info("🎉 CA Lobby App initialization completed successfully")
    logger.info(f"📍 Available endpoints:")
    logger.info(f"  - Health Check: /api/health")
    logger.info(f"  - API Root: /api/")
    logger.info(f"  - Authentication: /api/auth/*")
    logger.info(f"  - Dashboard: /api/dashboard/*")
    logger.info(f"  - Search: /api/search/*")
    logger.info(f"  - Reports: /api/reports/*")
    logger.info(f"  - Data: /api/data/*")
    logger.info(f"  - Export: /api/export/*")
    logger.info(f"  - Admin: /api/admin/*")

    return app

# Create app instance for Vercel WSGI runtime
logger.info("🚀 Creating app instance for WSGI runtime")
app = create_app()
logger.info("✅ App instance created successfully")

if __name__ == '__main__':
    # For local development only
    logger.info("🔧 Starting in local development mode")

    # Development server settings
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    port = int(os.getenv('PORT', 5000))

    logger.info(f"🏃 Starting development server:")
    logger.info(f"  - Host: 0.0.0.0")
    logger.info(f"  - Port: {port}")
    logger.info(f"  - Debug mode: {debug_mode}")
    logger.info(f"  - Threading: True")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug_mode,
        threaded=True
    )