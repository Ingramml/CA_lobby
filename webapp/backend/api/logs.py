"""
Frontend Logs API Blueprint
Receives logs from frontend and forwards to Vercel dashboard
"""
import logging
from flask import Blueprint, request, jsonify
from datetime import datetime

# Create blueprint
bp = Blueprint('logs', __name__)

# Create logger
logger = logging.getLogger('ca_lobby_app.logs')

@bp.route('/frontend', methods=['POST'])
def receive_frontend_logs():
    """Receive logs from frontend and forward to Vercel dashboard"""
    try:
        data = request.get_json()
        if not data or 'logs' not in data:
            return jsonify({'error': 'Invalid request format'}), 400

        logs = data['logs']
        processed_count = 0

        for log_entry in logs:
            try:
                level = log_entry.get('level', 'INFO')
                message = log_entry.get('message', '')
                component = log_entry.get('component', 'Frontend')
                session_id = log_entry.get('sessionId', 'unknown')
                url = log_entry.get('url', '')
                timestamp = log_entry.get('timestamp', datetime.utcnow().isoformat())

                # Include additional context
                context_data = {
                    'session_id': session_id,
                    'url': url,
                    'timestamp': timestamp,
                    'user_agent': log_entry.get('userAgent', ''),
                    'data': log_entry.get('data')
                }

                # Format message for Vercel dashboard
                formatted_message = f"🌐 [{component}] {message}"
                if context_data.get('data'):
                    formatted_message += f" | Data: {context_data['data']}"

                formatted_message += f" | Session: {session_id[:8]}... | URL: {url}"

                # Log at appropriate level
                if level == 'DEBUG':
                    logger.debug(formatted_message)
                elif level == 'INFO':
                    logger.info(formatted_message)
                elif level == 'WARN':
                    logger.warning(formatted_message)
                elif level == 'ERROR':
                    logger.error(formatted_message)
                else:
                    logger.info(formatted_message)

                processed_count += 1

            except Exception as e:
                logger.error(f"❌ Failed to process frontend log entry: {e}")
                continue

        logger.info(f"📥 Processed {processed_count}/{len(logs)} frontend log entries")

        return jsonify({
            'status': 'success',
            'processed': processed_count,
            'total': len(logs)
        }), 200

    except Exception as e:
        logger.error(f"❌ Failed to process frontend logs: {e}")
        return jsonify({'error': 'Failed to process logs'}), 500

@bp.route('/health', methods=['GET'])
def logs_health():
    """Health check for logs endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'frontend-logs',
        'timestamp': datetime.utcnow().isoformat()
    }), 200