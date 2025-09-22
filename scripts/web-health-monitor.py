#!/usr/bin/env python3
"""
Web Health Monitor for CA Lobby Application
Continuously monitors webapp health endpoints and logs status
"""

import requests
import time
import json
import sys
import os
from datetime import datetime
from pathlib import Path

class WebHealthMonitor:
    def __init__(self, config_file=None):
        self.config = self.load_config(config_file)
        self.log_file = Path("logs/health_monitor.log")
        self.log_file.parent.mkdir(exist_ok=True)

    def load_config(self, config_file):
        """Load monitoring configuration"""
        default_config = {
            "endpoints": {
                "local": {
                    "base_url": "http://localhost:5001",
                    "endpoints": ["/api/health", "/api/status", "/api/test-data-access"]
                },
                "production": {
                    "base_url": "https://rtest1-beta.vercel.app",
                    "endpoints": ["/api/health", "/api/status"]
                }
            },
            "check_interval": 30,  # seconds
            "timeout": 10,
            "max_retries": 3,
            "alert_threshold": 3  # consecutive failures before alert
        }

        if config_file and os.path.exists(config_file):
            with open(config_file, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)

        return default_config

    def log_event(self, level, message, data=None):
        """Log monitoring events"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": level,
            "message": message,
            "data": data
        }

        # Console output
        print(f"[{timestamp}] {level}: {message}")
        if data:
            print(f"  Data: {json.dumps(data, indent=2)}")

        # File output
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')

    def check_endpoint(self, base_url, endpoint):
        """Check a single endpoint and return status"""
        url = f"{base_url}{endpoint}"
        try:
            response = requests.get(
                url,
                timeout=self.config['timeout'],
                headers={'User-Agent': 'CA-Lobby-Health-Monitor/1.0'}
            )

            return {
                "url": url,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "success": response.status_code == 200,
                "response_data": response.json() if response.headers.get('content-type', '').startswith('application/json') else None,
                "error": None
            }
        except requests.exceptions.Timeout:
            return {
                "url": url,
                "status_code": None,
                "response_time": None,
                "success": False,
                "response_data": None,
                "error": "TIMEOUT"
            }
        except requests.exceptions.ConnectionError:
            return {
                "url": url,
                "status_code": None,
                "response_time": None,
                "success": False,
                "response_data": None,
                "error": "CONNECTION_ERROR"
            }
        except Exception as e:
            return {
                "url": url,
                "status_code": None,
                "response_time": None,
                "success": False,
                "response_data": None,
                "error": str(e)
            }

    def check_environment(self, env_name):
        """Check all endpoints for a given environment"""
        env_config = self.config['endpoints'].get(env_name)
        if not env_config:
            self.log_event("ERROR", f"Environment '{env_name}' not configured")
            return False

        base_url = env_config['base_url']
        endpoints = env_config['endpoints']

        self.log_event("INFO", f"Checking {env_name} environment: {base_url}")

        all_healthy = True
        results = []

        for endpoint in endpoints:
            result = self.check_endpoint(base_url, endpoint)
            results.append(result)

            if result['success']:
                self.log_event("SUCCESS", f"✅ {endpoint} - {result['response_time']:.3f}s")
            else:
                self.log_event("ERROR", f"❌ {endpoint} - {result['error'] or 'HTTP ' + str(result['status_code'])}")
                all_healthy = False

        # Summary
        healthy_count = sum(1 for r in results if r['success'])
        total_count = len(results)

        self.log_event("INFO", f"Environment {env_name}: {healthy_count}/{total_count} endpoints healthy")

        return all_healthy

    def run_single_check(self, environment=None):
        """Run a single health check cycle"""
        environments = [environment] if environment else list(self.config['endpoints'].keys())

        overall_health = True
        for env in environments:
            env_health = self.check_environment(env)
            overall_health = overall_health and env_health

        return overall_health

    def run_continuous_monitoring(self, environment=None):
        """Run continuous monitoring"""
        consecutive_failures = 0

        self.log_event("INFO", "Starting continuous web health monitoring")
        self.log_event("INFO", f"Check interval: {self.config['check_interval']} seconds")

        try:
            while True:
                cycle_start = time.time()

                is_healthy = self.run_single_check(environment)

                if is_healthy:
                    consecutive_failures = 0
                else:
                    consecutive_failures += 1
                    if consecutive_failures >= self.config['alert_threshold']:
                        self.log_event("ALERT", f"🚨 ALERT: {consecutive_failures} consecutive failures detected!")

                # Calculate sleep time to maintain interval
                cycle_duration = time.time() - cycle_start
                sleep_time = max(0, self.config['check_interval'] - cycle_duration)

                if sleep_time > 0:
                    time.sleep(sleep_time)

        except KeyboardInterrupt:
            self.log_event("INFO", "Monitoring stopped by user")
        except Exception as e:
            self.log_event("ERROR", f"Monitoring failed: {str(e)}")

def main():
    import argparse

    parser = argparse.ArgumentParser(description='CA Lobby Web Health Monitor')
    parser.add_argument('--environment', '-e',
                       choices=['local', 'production', 'all'],
                       default='all',
                       help='Environment to monitor')
    parser.add_argument('--single', '-s',
                       action='store_true',
                       help='Run single check instead of continuous monitoring')
    parser.add_argument('--config', '-c',
                       help='Path to configuration file')

    args = parser.parse_args()

    monitor = WebHealthMonitor(args.config)

    environment = None if args.environment == 'all' else args.environment

    if args.single:
        success = monitor.run_single_check(environment)
        sys.exit(0 if success else 1)
    else:
        monitor.run_continuous_monitoring(environment)

if __name__ == "__main__":
    main()