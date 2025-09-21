# CA Lobby Diagnostic Agents

A comprehensive diagnostic system for detecting and monitoring issues in your Next.js application. This system provides specialized agents for authentication, TypeScript, runtime errors, build issues, and network problems.

## Features

- **🔐 Auth/Clerk Diagnostics** - Detects authentication configuration issues, missing environment variables, and Clerk integration problems
- **📝 TypeScript Diagnostics** - Finds compilation errors, type mismatches, and configuration issues
- **⚡ Runtime Diagnostics** - Monitors JavaScript runtime errors, memory leaks, and performance issues
- **🔨 Build Diagnostics** - Checks build processes, dependencies, and webpack configuration
- **🌐 Network Diagnostics** - Tests API connectivity, CORS issues, and request failures
- **📊 Real-time Monitoring** - Continuous monitoring with immediate issue detection
- **🤖 Automated Reporting** - Generates comprehensive reports in multiple formats
- **⚙️ Configurable** - Extensive configuration options for all environments

## Quick Start

### 1. Basic Usage

```typescript
import { runDiagnostic } from './diagnostic-agents'

// Run a complete diagnostic scan
const report = await runDiagnostic()

console.log(`Found ${report.summary.totalIssues} issues`)
```

### 2. Start Real-time Monitoring

```typescript
import { startMonitoring } from './diagnostic-agents'

// Start monitoring with event handlers
const coordinator = await startMonitoring({
  onIssue: (event) => {
    console.log('Issue detected:', event.data.title)
  },
  onScanComplete: (report) => {
    console.log(`Scan completed: ${report.summary.totalIssues} issues`)
  }
})
```

### 3. Development Integration

```typescript
import { setupDiagnostics } from './diagnostic-agents/utils/dev-integration'

// Set up automatic monitoring for development
const integration = await setupDiagnostics({
  autostart: true,
  periodicScan: true,
  scanInterval: 60000, // 1 minute
  onIssue: (issue) => {
    console.log(`🚨 ${issue.title}: ${issue.description}`)
  }
})
```

## Installation & Setup

### 1. Install Dependencies

The diagnostic agents require a few additional packages:

```bash
npm install uuid commander
npm install -D @types/uuid
```

### 2. Add to Your Next.js Project

#### Option A: Automatic Development Integration

Add to your `next.config.js`:

```javascript
const { onDevServerStart } = require('./diagnostic-agents/utils/dev-integration')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config...
}

// Start diagnostics in development
if (process.env.NODE_ENV === 'development') {
  onDevServerStart({
    autostart: true,
    periodicScan: true,
    scanInterval: 60000
  })
}

module.exports = nextConfig
```

#### Option B: Manual Integration

Create a `diagnostics.js` file in your project root:

```javascript
const { DiagnosticCoordinator, createConfig } = require('./diagnostic-agents')

async function runDiagnostics() {
  const config = await createConfig({ environment: 'development' })
  const coordinator = new DiagnosticCoordinator(config)

  const report = await coordinator.runDiagnostic()
  console.log('Diagnostic Report:', report.summary)
}

runDiagnostics().catch(console.error)
```

### 3. Add API Route (Optional)

Create `app/api/diagnostics/route.ts`:

```typescript
import { DiagnosticCoordinator, createConfig } from '../../../diagnostic-agents'

let coordinator: DiagnosticCoordinator | null = null

async function getCoordinator() {
  if (!coordinator) {
    const config = await createConfig({ environment: 'development' })
    coordinator = new DiagnosticCoordinator(config)
  }
  return coordinator
}

export async function GET() {
  const coord = await getCoordinator()
  const stats = coord.getStatistics()
  const issues = coord.getActiveIssues()

  return Response.json({
    status: 'running',
    statistics: stats,
    issues: issues.slice(0, 10)
  })
}

export async function POST() {
  const coord = await getCoordinator()
  const report = await coord.runDiagnostic()

  return Response.json({
    message: 'Scan completed',
    summary: report.summary,
    timestamp: report.timestamp
  })
}
```

## CLI Usage

### Basic Commands

```bash
# Run complete diagnostic scan
node diagnostic-agents/cli.js scan

# Run specific agent
node diagnostic-agents/cli.js auth
node diagnostic-agents/cli.js typescript
node diagnostic-agents/cli.js runtime
node diagnostic-agents/cli.js build
node diagnostic-agents/cli.js network

# Start real-time monitoring
node diagnostic-agents/cli.js monitor

# Initialize configuration
node diagnostic-agents/cli.js config init
```

### CLI Options

```bash
# Scan with options
node diagnostic-agents/cli.js scan --env production --format markdown --output ./reports

# Agent-specific options
node diagnostic-agents/cli.js auth --dev-bypass
node diagnostic-agents/cli.js typescript --strict --config ./tsconfig.custom.json
node diagnostic-agents/cli.js build --command "yarn build"
node diagnostic-agents/cli.js network --timeout 10000 --no-connectivity

# Monitoring options
node diagnostic-agents/cli.js monitor --interval 30 --env development
```

## Configuration

### Default Configuration

Create `diagnostic.config.json`:

```json
{
  "enabled": true,
  "logLevel": "info",
  "outputDir": "./diagnostic-reports",
  "autoFix": false,
  "realTimeMonitoring": true,
  "agents": {
    "auth": {
      "checkClerkProvider": true,
      "checkUserContext": true,
      "checkMiddleware": true,
      "checkEnvironmentVars": true,
      "checkAuthFlows": true,
      "devModeBypass": true
    },
    "typescript": {
      "strictMode": true,
      "checkTypes": true,
      "checkImports": true,
      "checkExports": true,
      "checkInterfaces": true
    },
    "runtime": {
      "monitorConsole": true,
      "checkUndefinedVars": true,
      "checkAsyncErrors": true,
      "checkDOMErrors": true,
      "checkModuleErrors": true,
      "captureUnhandledRejections": true
    },
    "build": {
      "monitorNextBuild": true,
      "checkWebpack": true,
      "checkDependencies": true,
      "checkCSS": true,
      "checkHotReload": true,
      "buildCommand": "npm run build"
    },
    "network": {
      "monitorAPIcalls": true,
      "checkCORS": true,
      "checkTimeouts": true,
      "checkConnectivity": true,
      "checkGraphQL": true,
      "maxRetries": 3,
      "timeoutThreshold": 5000
    }
  }
}
```

### Environment-Specific Configuration

```typescript
import { createConfig } from './diagnostic-agents'

// Development configuration
const devConfig = await createConfig({
  environment: 'development',
  override: {
    logLevel: 'debug',
    realTimeMonitoring: true
  }
})

// Production configuration
const prodConfig = await createConfig({
  environment: 'production',
  override: {
    logLevel: 'warn',
    autoFix: false
  }
})

// CI/CD configuration
const ciConfig = await createConfig({
  environment: 'ci',
  override: {
    realTimeMonitoring: false,
    outputDir: './ci-reports'
  }
})
```

## Advanced Usage

### Custom Agent Implementation

```typescript
import { BaseDiagnosticAgent, DiagnosticIssue } from './diagnostic-agents'

class CustomAgent extends BaseDiagnosticAgent {
  constructor() {
    super('Custom Agent', '1.0.0', 'custom')
  }

  async scan(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    // Your custom diagnostic logic
    const hasIssue = await this.checkCustomCondition()

    if (hasIssue) {
      issues.push(
        this.createIssue(
          'Custom Issue Detected',
          'Description of the issue',
          'medium',
          'custom-check',
          ['Suggestion 1', 'Suggestion 2']
        )
      )
    }

    return issues
  }

  private async checkCustomCondition(): Promise<boolean> {
    // Your custom check logic
    return false
  }
}
```

### Event Handling

```typescript
import { DiagnosticCoordinator } from './diagnostic-agents'

const coordinator = new DiagnosticCoordinator()

// Listen for real-time issues
coordinator.on('issue', (event) => {
  const issue = event.data

  if (issue.severity === 'critical') {
    // Send alert, log to external service, etc.
    console.error('CRITICAL ISSUE:', issue.title)
  }
})

// Listen for agent events
coordinator.on('agent_started', (event) => {
  console.log(`Agent ${event.agentName} started`)
})

coordinator.on('agent_error', (event) => {
  console.error(`Agent ${event.agentName} error:`, event.data.error)
})

// Listen for scan completion
coordinator.on('scan_complete', (report) => {
  console.log('Scan completed:', report.summary)
})
```

### Integration with CI/CD

#### GitHub Actions Example

```yaml
name: Diagnostic Scan

on: [push, pull_request]

jobs:
  diagnostics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install

      - name: Run Diagnostic Scan
        run: |
          node diagnostic-agents/cli.js scan --env ci --format json --output ./reports

      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: diagnostic-reports
          path: ./reports/

      - name: Comment PR with Results
        if: github.event_name == 'pull_request'
        run: |
          node diagnostic-agents/cli.js scan --format markdown > diagnostic-summary.md
          # Use GitHub CLI to comment on PR
```

#### Package.json Scripts

```json
{
  "scripts": {
    "diagnostic": "node diagnostic-agents/cli.js scan",
    "diagnostic:auth": "node diagnostic-agents/cli.js auth",
    "diagnostic:build": "node diagnostic-agents/cli.js build",
    "diagnostic:monitor": "node diagnostic-agents/cli.js monitor",
    "diagnostic:ci": "node diagnostic-agents/cli.js scan --env ci --format json"
  }
}
```

## Report Formats

### JSON Report

```json
{
  "id": "diag-12345",
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "totalIssues": 5,
    "criticalIssues": 1,
    "highIssues": 2,
    "mediumIssues": 1,
    "lowIssues": 1,
    "infoIssues": 0
  },
  "issues": [...],
  "recommendations": [...],
  "metadata": {...}
}
```

### Markdown Report

```markdown
# Diagnostic Report

**Generated:** 2024-01-15T10:30:00Z

## Summary
- **Total Issues:** 5
- **🚨 Critical:** 1
- **⚠️ High:** 2

## Recommendations
- 🚨 Address 1 critical issues immediately
- ⚠️ Review 2 high-priority issues

## Auth Issues (3)
### 🚨 Missing Required Environment Variable: CLERK_SECRET_KEY
...
```

### CSV Export

```csv
Title,Severity,Category,Source,File,Line,Description
"Missing Environment Variable",critical,auth,environment-check,,,"CLERK_SECRET_KEY is required"
```

## Troubleshooting

### Common Issues

#### 1. Permission Errors
```bash
# Fix permission issues
chmod +x diagnostic-agents/cli.js
```

#### 2. Missing Dependencies
```bash
# Install missing dependencies
npm install uuid commander
npm install -D @types/uuid
```

#### 3. TypeScript Compilation Errors
```bash
# Check TypeScript configuration
node diagnostic-agents/cli.js typescript --strict
```

#### 4. Network Connectivity Issues
```bash
# Test network connectivity
node diagnostic-agents/cli.js network --timeout 10000
```

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development node diagnostic-agents/cli.js scan --format markdown
```

### Log Files

Diagnostic logs are saved to:
- Console output (default)
- `./diagnostic-reports/` (configurable)
- Custom log files (via configuration)

## Performance Considerations

### Memory Usage
- Diagnostic agents use approximately 50-100MB of memory
- Log history is limited to 1000 entries by default
- Large projects may take 30-60 seconds for full scans

### Best Practices
1. Run full scans in CI/CD, not in production
2. Use real-time monitoring for development
3. Configure appropriate scan intervals
4. Disable agents not needed for your project
5. Use appropriate log levels for each environment

## Contributing

To add new diagnostic capabilities:

1. Create a new agent extending `BaseDiagnosticAgent`
2. Implement the `scan()` method
3. Add configuration options to types
4. Register the agent in the coordinator
5. Add CLI commands and documentation

Example agent structure:
```typescript
export class NewAgent extends BaseDiagnosticAgent {
  constructor() {
    super('New Agent', '1.0.0', 'category')
  }

  async scan(): Promise<DiagnosticIssue[]> {
    // Implementation
  }
}
```

## License

This diagnostic system is part of the CA Lobby project and follows the same license terms.