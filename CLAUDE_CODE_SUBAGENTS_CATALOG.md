# Claude Code Subagents Catalog

## Overview

This document provides a comprehensive catalog of all specialized subagents available in Claude Code, designed to help recreate and utilize these agents in other projects. Each agent has specific capabilities and use cases that make them valuable for different types of development tasks.

## Available Subagents

### 1. General-Purpose Agent
**Type**: `general-purpose`

**Description**: A versatile agent for researching complex questions, searching for code, and executing multi-step tasks autonomously.

**Tools Available**: All tools (*)

**Best Use Cases**:
- Complex research tasks requiring multiple rounds of investigation
- Code searching across large codebases when initial searches might not find the right match
- Multi-step tasks requiring coordination of different tools
- Open-ended exploration and analysis

**When to Use**:
- When you need to search for keywords or files and aren't confident you'll find the right match in the first few tries
- For complex investigations requiring multiple tool combinations
- When the task scope is broad and requires adaptive problem-solving

**Example Usage**:
```
Task(
    subagent_type="general-purpose",
    description="Research authentication patterns",
    prompt="Search through this codebase to understand all authentication patterns being used, analyze their implementation, and provide a comprehensive report on security practices and potential improvements."
)
```

### 2. Status Line Setup Agent
**Type**: `statusline-setup`

**Description**: Specialized agent for configuring Claude Code's status line settings.

**Tools Available**: Read, Edit

**Best Use Cases**:
- Configuring or customizing Claude Code status line display
- Setting up development environment preferences
- Adjusting IDE integration settings

**When to Use**:
- When users need help configuring their Claude Code status line
- For customizing development environment display options

### 3. Output Style Setup Agent
**Type**: `output-style-setup`

**Description**: Agent dedicated to creating and configuring Claude Code output styles.

**Tools Available**: Read, Write, Edit, Glob, Grep

**Best Use Cases**:
- Creating custom output formatting styles
- Configuring display preferences for code output
- Setting up project-specific output configurations

**When to Use**:
- When customizing how Claude Code displays output
- For setting up consistent output formatting across projects

### 4. Website Coding Specialist
**Type**: `website-coding-specialist`

**Description**: Expert agent for designing user interfaces for database-driven applications, creating data visualization layouts, and optimizing web interfaces.

**Tools Available**: Bash, Glob, Grep, Read, Edit, MultiEdit, Write, NotebookEdit, WebFetch, TodoWrite, WebSearch, BashOutput, KillShell

**Specializations**:
- Database-driven application interfaces
- Data visualization layouts
- Form design for data entry
- Dashboard interfaces
- Table and grid layouts
- Responsive data-heavy interfaces
- UX patterns for database applications

**Best Use Cases**:
- Customer dashboards with multiple data views
- Data tables with advanced filtering and sorting
- Form workflows for efficient data entry
- Responsive layouts for data-heavy applications
- Complex relational database system interfaces
- Dashboard and analytics interfaces
- Navigation patterns for hierarchical data
- Bulk data operation interfaces
- Search and filtering systems for large datasets
- Database application performance optimization through UI design

**When to Use**:
- Designing any database-driven web interface
- Creating data visualization components
- Optimizing data entry workflows
- Building complex dashboard systems

**Example Usage**:
```
Task(
    subagent_type="website-coding-specialist",
    description="Design customer dashboard interface",
    prompt="I need to design a customer dashboard that shows customer details, recent orders, and payment history. Please provide a complete interface design with proper data visualization and responsive layout."
)
```

### 5. Session Archiver Agent
**Type**: `session-archiver`

**Description**: Specialized agent for archiving and summarizing Claude AI conversation sessions with learning-focused summaries.

**Tools Available**: Bash, Glob, Grep, Read, Edit, MultiEdit, Write, NotebookEdit, WebFetch, TodoWrite, WebSearch, BashOutput, KillShell

**Operating Location**: **Session_Archives folder within current project directory** (organized storage with version control integration)

**Archive Structure**:
```
ProjectName/
└── Session_Archives/
    ├── SESSION_ARCHIVE_[timestamp].md
    ├── SESSION_SUMMARY_[timestamp].md
    └── SESSION_PLAN_[timestamp].md
```

**Archive Output Files**:
- `SESSION_ARCHIVE_[timestamp].md` - Complete conversation record
- `SESSION_SUMMARY_[timestamp].md` - Learning-focused summary with key insights
- `SESSION_PLAN_[timestamp].md` - Planning documentation and implementation tracking

**Best Use Cases**:
- Archiving completed coding sessions
- Creating learning-focused summaries
- Preserving debugging sessions for future reference
- Converting sessions into structured learning resources
- Maintaining project knowledge base within repository

**When to Use**:
- At the end of productive coding sessions
- After complex troubleshooting or debugging sessions
- When you want to preserve insights for future reference
- To create learning resources from conversation sessions
- For maintaining team knowledge and decision history

**Key Benefits**:
- **Organized Storage**: Clean separation of archives from project code files
- **Version Control Integration**: Archives become part of the git repository
- **Team Knowledge Sharing**: All team members can access session insights in dedicated folder
- **Context Preservation**: Technical decisions stay with the project in organized structure
- **Easy Discovery**: All session documentation centralized in Session_Archives folder
- **Future Reference**: Easy access to implementation rationale and lessons learned

**Example Usage**:
```
Task(
    subagent_type="session-archiver",
    description="Archive debugging session",
    prompt="Archive this debugging session and create a detailed summary with the solutions we discovered for future reference. Store all archive files in the Session_Archives folder within the current project."
)
```

### 6. Vercel Deployment Expert
**Type**: `vercel-deployment-expert`

**Description**: Expert agent for reviewing projects for Vercel deployment readiness, optimizing deployment configurations, and troubleshooting deployment issues.

**Tools Available**: Bash, Glob, Grep, Read, Edit, MultiEdit, Write, NotebookEdit, WebFetch, TodoWrite, WebSearch, BashOutput, KillShell

**Specializations**:
- Vercel deployment readiness assessment
- Deployment configuration optimization
- Troubleshooting deployment failures
- Vercel hosting best practices
- Build optimization for Vercel platform
- Environment variable configuration
- Serverless function optimization

**Best Use Cases**:
- Pre-deployment project review
- Deployment failure troubleshooting
- Performance optimization for Vercel
- Configuration validation
- Best practices implementation

**When to Use**:
- Before deploying a new project to Vercel
- When experiencing deployment failures
- For optimizing existing Vercel deployments
- When setting up complex Vercel configurations

**Example Usage**:
```
Task(
    subagent_type="vercel-deployment-expert",
    description="Review Next.js deployment setup",
    prompt="I've just created a new Next.js app with custom API routes and want to deploy it to Vercel. Can you review my setup and identify any potential issues before deployment?"
)
```

### 7. UI Database Designer
**Type**: `ui-database-designer`

**Description**: Expert agent for designing user interfaces specifically for database-driven applications with focus on data relationships and user experience.

**Tools Available**: Bash, Glob, Grep, Read, Edit, MultiEdit, Write, NotebookEdit, WebFetch, TodoWrite, WebSearch, BashOutput, KillShell

**Specializations**:
- Database-driven UI design
- Data visualization layouts
- Form optimization for data entry
- Dashboard interface design
- Table and grid layouts
- Responsive data interfaces
- UX patterns for database applications
- Complex relational data display
- Data entry workflow optimization

**Best Use Cases**:
- Customer management systems
- Inventory management interfaces
- Financial dashboard design
- Data analytics interfaces
- Complex form design for databases
- Reporting interface design

**When to Use**:
- Designing interfaces for database applications
- Creating data visualization components
- Optimizing data entry workflows
- Planning complex data relationship displays
- Building dashboard interfaces

**Example Usage**:
```
Task(
    subagent_type="ui-database-designer",
    description="Design inventory management interface",
    prompt="How should I display this complex inventory data with multiple relationships between products, categories, and suppliers? I need an intuitive interface for this complex relational data."
)
```

## Usage Guidelines

### When to Use Specialized Agents

1. **Task Complexity**: Use specialized agents for complex, multi-step tasks that match their expertise
2. **Domain Expertise**: Choose agents that match the specific domain (UI design, deployment, etc.)
3. **Tool Requirements**: Consider which tools the agent needs access to
4. **Scope of Work**: Specialized agents are better for focused, expert-level tasks

### When NOT to Use Agents

- Simple, single-step tasks
- Reading specific files (use Read tool directly)
- Quick searches in small codebases (use Grep/Glob directly)
- Tasks outside the agent's specialization

### Best Practices

1. **Clear Task Description**: Provide detailed, specific task descriptions
2. **Expected Output**: Specify exactly what information you want returned
3. **Parallel Execution**: Launch multiple agents concurrently when possible
4. **Autonomous Operation**: Design prompts for fully autonomous execution

## Agent Selection Matrix

| Task Type | Recommended Agent | Alternative |
|-----------|------------------|-------------|
| Complex Research | general-purpose | - |
| UI/UX Design | website-coding-specialist or ui-database-designer | general-purpose |
| Deployment Issues | vercel-deployment-expert | general-purpose |
| Session Documentation | session-archiver | general-purpose |
| Database Interface Design | ui-database-designer | website-coding-specialist |
| Code Architecture Analysis | general-purpose | - |
| Configuration Setup | statusline-setup or output-style-setup | general-purpose |

## Integration Examples

### Multi-Agent Workflow
```
# Launch agents in parallel for comprehensive project setup
Task(subagent_type="vercel-deployment-expert", ...)
Task(subagent_type="ui-database-designer", ...)
Task(subagent_type="general-purpose", ...)
```

### Sequential Agent Usage
```
# First: Research with general-purpose
# Then: Design with ui-database-designer
# Finally: Deploy with vercel-deployment-expert
```

## Recreating Agents in New Projects

### Essential Configuration
1. **Tool Access**: Ensure the new environment has the same tool availability
2. **Working Directory**: Set appropriate working directories
3. **Permissions**: Configure file system and execution permissions
4. **Dependencies**: Install required dependencies for agent operations

### Environment Setup
```bash
# Ensure Claude Code environment is properly configured
# Set up agent working directories
mkdir -p ~/.claude/agents/
# Configure tool permissions
# Set up project-specific configurations
```

### Validation Checklist
- [ ] All required tools are available
- [ ] Agent descriptions match capabilities
- [ ] Working directories are accessible
- [ ] Permissions are properly configured
- [ ] Integration with main Claude Code system works

---

*This catalog serves as a complete reference for recreating and utilizing Claude Code subagents across different projects and environments.*