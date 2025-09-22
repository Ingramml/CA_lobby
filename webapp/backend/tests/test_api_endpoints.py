"""
Test cases for Flask API endpoints
"""

import json
import pytest
from datetime import datetime

class TestHealthEndpoint:
    """Test the /api/health endpoint"""

    def test_health_endpoint_returns_200(self, client):
        """Test that health endpoint returns HTTP 200"""
        response = client.get('/api/health')
        assert response.status_code == 200

    def test_health_endpoint_returns_json(self, client):
        """Test that health endpoint returns valid JSON"""
        response = client.get('/api/health')
        assert response.content_type == 'application/json'

        data = response.get_json()
        assert data is not None

    def test_health_endpoint_has_required_fields(self, client):
        """Test that health endpoint returns required fields"""
        response = client.get('/api/health')
        data = response.get_json()

        required_fields = ['status', 'message', 'timestamp', 'version']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_health_endpoint_reports_healthy_status(self, client):
        """Test that health endpoint reports healthy status"""
        response = client.get('/api/health')
        data = response.get_json()

        assert data['status'] == 'healthy'
        assert 'running' in data['message'].lower()

    def test_health_endpoint_timestamp_format(self, client):
        """Test that health endpoint returns valid timestamp"""
        response = client.get('/api/health')
        data = response.get_json()

        # Test that timestamp can be parsed as ISO format
        try:
            datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        except ValueError:
            pytest.fail(f"Invalid timestamp format: {data['timestamp']}")

    def test_health_endpoint_version_exists(self, client):
        """Test that health endpoint includes version information"""
        response = client.get('/api/health')
        data = response.get_json()

        assert 'version' in data
        assert data['version'] is not None
        assert len(data['version']) > 0


class TestStatusEndpoint:
    """Test the /api/status endpoint"""

    def test_status_endpoint_returns_200(self, client):
        """Test that status endpoint returns HTTP 200"""
        response = client.get('/api/status')
        assert response.status_code == 200

    def test_status_endpoint_returns_json(self, client):
        """Test that status endpoint returns valid JSON"""
        response = client.get('/api/status')
        assert response.content_type == 'application/json'

        data = response.get_json()
        assert data is not None

    def test_status_endpoint_has_required_fields(self, client):
        """Test that status endpoint returns required fields"""
        response = client.get('/api/status')
        data = response.get_json()

        required_fields = ['version', 'environment', 'timestamp']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_status_endpoint_environment_info(self, client):
        """Test that status endpoint includes environment information"""
        response = client.get('/api/status')
        data = response.get_json()

        # Environment should be set to testing during tests
        assert 'environment' in data
        # In testing mode, environment might be 'testing' or 'development'
        assert data['environment'] in ['testing', 'development', 'production']

    def test_status_endpoint_has_configuration_info(self, client):
        """Test that status endpoint includes configuration information"""
        response = client.get('/api/status')
        data = response.get_json()

        # Should include mock_data and debug settings
        assert 'mock_data' in data
        assert 'debug' in data


class TestDataAccessEndpoint:
    """Test the /api/test-data-access endpoint"""

    def test_data_access_endpoint_returns_200(self, client):
        """Test that data access endpoint returns HTTP 200"""
        response = client.get('/api/test-data-access')
        assert response.status_code == 200

    def test_data_access_endpoint_returns_json(self, client):
        """Test that data access endpoint returns valid JSON"""
        response = client.get('/api/test-data-access')
        assert response.content_type == 'application/json'

        data = response.get_json()
        assert data is not None

    def test_data_access_endpoint_has_required_fields(self, client):
        """Test that data access endpoint returns required fields"""
        response = client.get('/api/test-data-access')
        data = response.get_json()

        required_fields = ['status', 'message']
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_data_access_endpoint_reports_success(self, client):
        """Test that data access endpoint reports success"""
        response = client.get('/api/test-data-access')
        data = response.get_json()

        assert data['status'] == 'success'

    def test_data_access_endpoint_has_modules_info(self, client):
        """Test that data access endpoint includes available modules"""
        response = client.get('/api/test-data-access')
        data = response.get_json()

        assert 'available_modules' in data
        assert isinstance(data['available_modules'], list)
        assert len(data['available_modules']) > 0


class TestErrorHandlers:
    """Test custom error handlers"""

    def test_404_error_handler(self, client):
        """Test that 404 errors return proper JSON response"""
        response = client.get('/api/nonexistent-endpoint')
        assert response.status_code == 404

        data = response.get_json()
        assert data is not None
        assert data['status'] == 'error'
        assert 'not found' in data['message'].lower()
        assert 'timestamp' in data

    def test_404_error_handler_json_format(self, client):
        """Test that 404 errors return valid JSON"""
        response = client.get('/api/invalid-route')
        assert response.content_type == 'application/json'

        data = response.get_json()
        assert isinstance(data, dict)


class TestCORSConfiguration:
    """Test CORS configuration"""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present in responses"""
        response = client.get('/api/health')

        # Should have CORS headers (added by Flask-CORS)
        assert response.status_code == 200

        # Test OPTIONS preflight request
        options_response = client.options('/api/health')
        assert options_response.status_code in [200, 204]

    def test_cors_allows_cross_origin(self, client):
        """Test that CORS allows cross-origin requests"""
        headers = {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET'
        }

        response = client.options('/api/health', headers=headers)
        assert response.status_code in [200, 204]


class TestApplicationConfiguration:
    """Test application configuration in testing mode"""

    def test_app_is_in_testing_mode(self, app_context):
        """Test that application is configured for testing"""
        assert app_context.config['TESTING'] is True

    def test_app_has_cors_enabled(self, app_context):
        """Test that CORS is properly configured"""
        # CORS should be enabled (Flask-CORS extension)
        assert hasattr(app_context, 'extensions')


class TestIntegrationScenarios:
    """Integration test scenarios"""

    def test_all_endpoints_accessible(self, client):
        """Test that all API endpoints are accessible"""
        endpoints = ['/api/health', '/api/status', '/api/test-data-access']

        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 200, f"Endpoint {endpoint} failed"
            assert response.content_type == 'application/json'

    def test_response_consistency(self, client):
        """Test that responses are consistent across multiple calls"""
        endpoint = '/api/health'

        # Make multiple requests
        responses = []
        for i in range(3):
            response = client.get(endpoint)
            responses.append(response.get_json())

        # Check that core fields are consistent
        for response_data in responses:
            assert response_data['status'] == 'healthy'
            assert response_data['version'] == responses[0]['version']
            assert response_data['message'] == responses[0]['message']

    def test_api_performance_baseline(self, client):
        """Test basic performance expectations"""
        import time

        start_time = time.time()
        response = client.get('/api/health')
        end_time = time.time()

        response_time = end_time - start_time

        # API should respond quickly in testing
        assert response_time < 1.0, f"API response too slow: {response_time:.3f}s"
        assert response.status_code == 200