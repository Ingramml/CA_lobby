from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
from datetime import datetime

# Add project root to path for importing data processing scripts
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
sys.path.insert(0, project_root)

app = Flask(__name__)
CORS(app)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

@app.route('/api/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'message': 'CA Lobby API is running',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/status')
def status():
    """System status endpoint"""
    return jsonify({
        'version': '1.0.0',
        'environment': os.getenv('FLASK_ENV', 'production'),
        'mock_data': os.getenv('USE_MOCK_DATA', 'true'),
        'debug': os.getenv('DEBUG', 'False'),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test-data-access')
def test_data_access():
    """Test access to existing data processing scripts"""
    try:
        # Test import of existing data processing modules
        import Bignewdownload_2
        import Bigquery_connection
        import determine_df

        return jsonify({
            'status': 'success',
            'message': 'Data processing scripts accessible',
            'available_modules': [
                'Bignewdownload_2',
                'Bigquery_connection',
                'determine_df'
            ]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Data access error: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found',
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)