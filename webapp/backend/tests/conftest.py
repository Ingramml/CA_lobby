"""
Pytest configuration and fixtures for Flask backend tests
"""

import pytest
import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app

@pytest.fixture
def client():
    """Create a test client for the Flask application"""
    app.config['TESTING'] = True
    app.config['ENV'] = 'testing'

    with app.test_client() as client:
        with app.app_context():
            yield client

@pytest.fixture
def runner():
    """Create a test runner for the Flask application"""
    return app.test_cli_runner()

@pytest.fixture
def app_context():
    """Create an application context for testing"""
    with app.app_context():
        yield app