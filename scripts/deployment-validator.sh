#!/bin/bash
"""
Deployment Validator for CA Lobby Application
Validates deployment health and functionality after deployment
"""

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/deployment_validation_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"

    case $level in
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Check if URL is accessible
check_url() {
    local url=$1
    local description=$2
    local timeout=${3:-10}

    log "INFO" "Checking $description: $url"

    if curl -s --max-time "$timeout" --fail "$url" > /dev/null; then
        log "SUCCESS" "$description is accessible"
        return 0
    else
        log "ERROR" "$description is not accessible"
        return 1
    fi
}

# Check API endpoint and validate JSON response
check_api_endpoint() {
    local url=$1
    local endpoint=$2
    local description=$3
    local timeout=${4:-10}

    local full_url="${url}${endpoint}"
    log "INFO" "Testing $description: $full_url"

    local response=$(curl -s --max-time "$timeout" --fail "$full_url" 2>/dev/null)
    local curl_exit_code=$?

    if [ $curl_exit_code -eq 0 ]; then
        # Check if response is valid JSON
        if echo "$response" | python3 -m json.tool > /dev/null 2>&1; then
            log "SUCCESS" "$description returned valid JSON"

            # Log response for debugging
            echo "$response" | python3 -m json.tool >> "$LOG_FILE"

            # Check for expected fields in health endpoint
            if [[ "$endpoint" == "/api/health" ]]; then
                if echo "$response" | grep -q '"status".*"healthy"'; then
                    log "SUCCESS" "Health endpoint reports healthy status"
                else
                    log "WARNING" "Health endpoint does not report healthy status"
                fi
            fi

            return 0
        else
            log "ERROR" "$description returned invalid JSON: $response"
            return 1
        fi
    else
        log "ERROR" "$description request failed (HTTP error or timeout)"
        return 1
    fi
}

# Test frontend static assets
check_frontend() {
    local base_url=$1

    log "INFO" "Validating frontend deployment"

    # Check main page
    if check_url "$base_url/" "Frontend homepage"; then
        # Check for React app indicators
        local html_content=$(curl -s --max-time 10 "$base_url/" 2>/dev/null)

        if echo "$html_content" | grep -q "react"; then
            log "SUCCESS" "React application detected in frontend"
        else
            log "WARNING" "React application indicators not found in frontend"
        fi

        if echo "$html_content" | grep -q "CA Lobby"; then
            log "SUCCESS" "CA Lobby branding found in frontend"
        else
            log "WARNING" "CA Lobby branding not found in frontend"
        fi

        return 0
    else
        return 1
    fi
}

# Test local development environment
validate_local_environment() {
    log "INFO" "=== Validating Local Development Environment ==="

    local local_errors=0

    # Check if Flask backend is running
    if check_api_endpoint "http://localhost:5001" "/api/health" "Local Flask health endpoint"; then
        check_api_endpoint "http://localhost:5001" "/api/status" "Local Flask status endpoint" || ((local_errors++))
        check_api_endpoint "http://localhost:5001" "/api/test-data-access" "Local Flask data access endpoint" || ((local_errors++))
    else
        log "ERROR" "Local Flask backend not accessible on port 5001"
        log "INFO" "Trying alternative port 5000..."
        if check_api_endpoint "http://localhost:5000" "/api/health" "Local Flask health endpoint (port 5000)"; then
            check_api_endpoint "http://localhost:5000" "/api/status" "Local Flask status endpoint (port 5000)" || ((local_errors++))
            check_api_endpoint "http://localhost:5000" "/api/test-data-access" "Local Flask data access endpoint (port 5000)" || ((local_errors++))
        else
            log "ERROR" "Local Flask backend not accessible on any port"
            ((local_errors++))
        fi
    fi

    return $local_errors
}

# Test production deployment
validate_production_deployment() {
    local deployment_url=$1

    if [ -z "$deployment_url" ]; then
        log "ERROR" "No deployment URL provided"
        return 1
    fi

    log "INFO" "=== Validating Production Deployment: $deployment_url ==="

    local prod_errors=0

    # Check frontend
    if check_frontend "$deployment_url"; then
        log "SUCCESS" "Frontend validation passed"
    else
        log "ERROR" "Frontend validation failed"
        ((prod_errors++))
    fi

    # Check API endpoints
    # Note: Production might have authentication protection
    log "INFO" "Testing API endpoints (may be protected by authentication)"

    if check_api_endpoint "$deployment_url" "/api/health" "Production Flask health endpoint"; then
        check_api_endpoint "$deployment_url" "/api/status" "Production Flask status endpoint" || log "WARNING" "Status endpoint may be protected"
    else
        log "WARNING" "API endpoints may be protected by Vercel authentication"
        log "INFO" "This is expected for production deployments"
    fi

    return $prod_errors
}

# Test build process
validate_build_process() {
    log "INFO" "=== Validating Build Process ==="

    local build_errors=0

    # Test frontend build
    log "INFO" "Testing frontend build process"
    cd "$PROJECT_ROOT/webapp/frontend"

    if npm run build > "$LOG_FILE.frontend_build" 2>&1; then
        log "SUCCESS" "Frontend build completed successfully"

        # Check if build directory exists and has expected files
        if [ -d "build" ] && [ -f "build/index.html" ]; then
            log "SUCCESS" "Build artifacts created successfully"
        else
            log "ERROR" "Build artifacts missing"
            ((build_errors++))
        fi
    else
        log "ERROR" "Frontend build failed"
        cat "$LOG_FILE.frontend_build" >> "$LOG_FILE"
        ((build_errors++))
    fi

    cd "$PROJECT_ROOT"
    return $build_errors
}

# Check system requirements
check_system_requirements() {
    log "INFO" "=== Checking System Requirements ==="

    local req_errors=0

    # Check Node.js
    if command -v node > /dev/null; then
        local node_version=$(node --version)
        log "SUCCESS" "Node.js available: $node_version"
    else
        log "ERROR" "Node.js not found"
        ((req_errors++))
    fi

    # Check Python
    if command -v python3 > /dev/null; then
        local python_version=$(python3 --version)
        log "SUCCESS" "Python available: $python_version"
    else
        log "ERROR" "Python3 not found"
        ((req_errors++))
    fi

    # Check Vercel CLI
    if command -v vercel > /dev/null; then
        local vercel_version=$(vercel --version)
        log "SUCCESS" "Vercel CLI available: $vercel_version"
    else
        log "ERROR" "Vercel CLI not found"
        ((req_errors++))
    fi

    # Check Git
    if command -v git > /dev/null; then
        local git_version=$(git --version)
        log "SUCCESS" "Git available: $git_version"
    else
        log "ERROR" "Git not found"
        ((req_errors++))
    fi

    return $req_errors
}

# Main validation function
main() {
    local deployment_url=""
    local skip_local=false
    local skip_production=false
    local skip_build=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --url)
                deployment_url="$2"
                shift 2
                ;;
            --skip-local)
                skip_local=true
                shift
                ;;
            --skip-production)
                skip_production=true
                shift
                ;;
            --skip-build)
                skip_build=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --url URL           Production deployment URL to validate"
                echo "  --skip-local        Skip local environment validation"
                echo "  --skip-production   Skip production deployment validation"
                echo "  --skip-build        Skip build process validation"
                echo "  --help, -h          Show this help message"
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    log "INFO" "Starting CA Lobby deployment validation"
    log "INFO" "Log file: $LOG_FILE"

    local total_errors=0

    # Check system requirements
    check_system_requirements || ((total_errors+=$?))

    # Validate build process
    if [ "$skip_build" = false ]; then
        validate_build_process || ((total_errors+=$?))
    fi

    # Validate local environment
    if [ "$skip_local" = false ]; then
        validate_local_environment || ((total_errors+=$?))
    fi

    # Validate production deployment
    if [ "$skip_production" = false ] && [ -n "$deployment_url" ]; then
        validate_production_deployment "$deployment_url" || ((total_errors+=$?))
    elif [ "$skip_production" = false ]; then
        log "WARNING" "No deployment URL provided, skipping production validation"
        log "INFO" "Use --url to specify production deployment URL"
    fi

    # Final summary
    log "INFO" "=== Validation Summary ==="
    if [ $total_errors -eq 0 ]; then
        log "SUCCESS" "All validations passed! 🎉"
        log "INFO" "Deployment is ready for production use"
        exit 0
    else
        log "ERROR" "Validation completed with $total_errors error(s)"
        log "ERROR" "Review the log file for details: $LOG_FILE"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"