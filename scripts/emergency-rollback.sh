#!/bin/bash
"""
Emergency Rollback Script for CA Lobby Application
Quickly rollback to a previous stable deployment
"""

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/emergency_rollback_$TIMESTAMP.log"

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
            echo -e "${RED}🚨 $message${NC}"
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

# Check if git tag exists
check_tag_exists() {
    local tag=$1
    if git tag -l | grep -q "^${tag}$"; then
        return 0
    else
        return 1
    fi
}

# List available stable tags
list_stable_tags() {
    log "INFO" "Available stable tags for rollback:"

    # List tags with version pattern
    local tags=$(git tag -l | grep -E "^v[0-9]+\.[0-9]+\.[0-9]+" | sort -V -r)

    if [ -z "$tags" ]; then
        log "WARNING" "No stable version tags found"
        log "INFO" "Available tags:"
        git tag -l | head -10
    else
        echo "$tags" | head -10
    fi
}

# Create backup before rollback
create_backup() {
    local backup_branch="backup-before-rollback-$TIMESTAMP"

    log "INFO" "Creating backup branch: $backup_branch"

    if git checkout -b "$backup_branch"; then
        log "SUCCESS" "Backup branch created: $backup_branch"
        git checkout -
        return 0
    else
        log "ERROR" "Failed to create backup branch"
        return 1
    fi
}

# Rollback to specific tag
rollback_to_tag() {
    local target_tag=$1
    local force_rollback=${2:-false}

    log "INFO" "=== Emergency Rollback to $target_tag ==="

    # Verify tag exists
    if ! check_tag_exists "$target_tag"; then
        log "ERROR" "Tag '$target_tag' does not exist"
        return 1
    fi

    # Show current status
    log "INFO" "Current branch: $(git branch --show-current)"
    log "INFO" "Current commit: $(git rev-parse --short HEAD)"

    # Check for uncommitted changes
    if ! git diff --quiet || ! git diff --cached --quiet; then
        if [ "$force_rollback" = false ]; then
            log "WARNING" "Uncommitted changes detected:"
            git status --porcelain
            log "ERROR" "Use --force to rollback anyway (will lose changes)"
            return 1
        else
            log "WARNING" "Forcing rollback despite uncommitted changes"
        fi
    fi

    # Create backup
    if ! create_backup; then
        log "ERROR" "Failed to create backup, aborting rollback"
        return 1
    fi

    # Perform rollback
    log "INFO" "Rolling back to tag: $target_tag"

    if git reset --hard "$target_tag"; then
        log "SUCCESS" "Git rollback completed"
    else
        log "ERROR" "Git rollback failed"
        return 1
    fi

    # Rebuild frontend after rollback
    log "INFO" "Rebuilding frontend after rollback"
    cd "$PROJECT_ROOT/webapp/frontend"

    if npm run build > "$LOG_FILE.rollback_build" 2>&1; then
        log "SUCCESS" "Frontend rebuild completed"
    else
        log "ERROR" "Frontend rebuild failed"
        cat "$LOG_FILE.rollback_build" >> "$LOG_FILE"
        return 1
    fi

    cd "$PROJECT_ROOT"

    # Deploy rolled back version
    log "INFO" "Deploying rolled back version"

    if vercel deploy --prod > "$LOG_FILE.rollback_deploy" 2>&1; then
        log "SUCCESS" "Rollback deployment completed"
        local deployment_url=$(tail -n 10 "$LOG_FILE.rollback_deploy" | grep -E "https://.*\.vercel\.app" | head -n 1)
        if [ -n "$deployment_url" ]; then
            log "INFO" "Rolled back deployment URL: $deployment_url"
        fi
    else
        log "ERROR" "Rollback deployment failed"
        cat "$LOG_FILE.rollback_deploy" >> "$LOG_FILE"
        return 1
    fi

    return 0
}

# Quick rollback to last stable version
quick_rollback() {
    log "INFO" "=== Quick Rollback to Last Stable Version ==="

    # Find the most recent stable tag
    local last_stable=$(git tag -l | grep -E "^v[0-9]+\.[0-9]+\.[0-9]+" | sort -V -r | head -n 1)

    if [ -z "$last_stable" ]; then
        log "ERROR" "No stable version tags found for quick rollback"
        log "INFO" "Available tags:"
        git tag -l | head -5
        return 1
    fi

    log "INFO" "Last stable version found: $last_stable"

    rollback_to_tag "$last_stable" true
}

# Validate rollback success
validate_rollback() {
    local deployment_url=$1

    log "INFO" "=== Validating Rollback Success ==="

    # Run deployment validator if available
    if [ -x "$SCRIPT_DIR/deployment-validator.sh" ]; then
        log "INFO" "Running deployment validation"
        if [ -n "$deployment_url" ]; then
            "$SCRIPT_DIR/deployment-validator.sh" --url "$deployment_url" --skip-local
        else
            "$SCRIPT_DIR/deployment-validator.sh" --skip-local --skip-production
        fi
    else
        log "WARNING" "Deployment validator not available, manual validation required"
    fi

    # Run health monitor check if available
    if [ -f "$SCRIPT_DIR/web-health-monitor.py" ]; then
        log "INFO" "Running health check"
        python3 "$SCRIPT_DIR/web-health-monitor.py" --single --environment production
    else
        log "WARNING" "Health monitor not available, manual health check required"
    fi
}

# Show help
show_help() {
    cat << EOF
Emergency Rollback Script for CA Lobby Application

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    rollback <tag>      Rollback to specific git tag
    quick              Quick rollback to last stable version
    list               List available stable tags
    help               Show this help message

Options:
    --force            Force rollback even with uncommitted changes
    --validate-url URL Validation URL for post-rollback testing

Examples:
    $0 list                           # List available stable tags
    $0 quick                          # Quick rollback to last stable
    $0 rollback v1.2.0               # Rollback to specific tag
    $0 rollback v1.2.0 --force       # Force rollback with uncommitted changes

Emergency Usage:
    If the system is completely broken:
    1. Run: $0 quick
    2. This will automatically rollback to the last stable tag
    3. Validation will run automatically

EOF
}

# Main function
main() {
    local command=""
    local target_tag=""
    local force_rollback=false
    local validate_url=""

    if [ $# -eq 0 ]; then
        show_help
        exit 1
    fi

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            rollback)
                command="rollback"
                if [ -n "$2" ] && [[ ! "$2" =~ ^-- ]]; then
                    target_tag="$2"
                    shift 2
                else
                    log "ERROR" "rollback command requires a tag argument"
                    exit 1
                fi
                ;;
            quick)
                command="quick"
                shift
                ;;
            list)
                command="list"
                shift
                ;;
            help|--help|-h)
                show_help
                exit 0
                ;;
            --force)
                force_rollback=true
                shift
                ;;
            --validate-url)
                validate_url="$2"
                shift 2
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Ensure we're in the project root
    cd "$PROJECT_ROOT"

    log "INFO" "Starting emergency rollback procedure"
    log "INFO" "Log file: $LOG_FILE"

    # Execute command
    case $command in
        rollback)
            if rollback_to_tag "$target_tag" "$force_rollback"; then
                log "SUCCESS" "Rollback to $target_tag completed successfully"
                validate_rollback "$validate_url"
            else
                log "ERROR" "Rollback to $target_tag failed"
                exit 1
            fi
            ;;
        quick)
            if quick_rollback; then
                log "SUCCESS" "Quick rollback completed successfully"
                validate_rollback "$validate_url"
            else
                log "ERROR" "Quick rollback failed"
                exit 1
            fi
            ;;
        list)
            list_stable_tags
            ;;
        *)
            log "ERROR" "No valid command specified"
            show_help
            exit 1
            ;;
    esac

    log "SUCCESS" "Emergency rollback procedure completed"
}

# Run main function with all arguments
main "$@"