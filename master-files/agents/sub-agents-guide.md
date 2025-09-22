# Sub Agents in Claude Code

Sub agents in Claude Code are specialized AI assistants that help with specific tasks. Here's what you need to know:

## Key Benefits
- **Context isolation**: Operate in separate context windows to preserve your main conversation
- **Specialization**: Each agent has expertise in specific domains (code review, debugging, data science, etc.)
- **Parallelization**: Can run multiple agents simultaneously for complex workflows
- **Tool restrictions**: Agents only have access to tools they need for their specific tasks

## How They Work
Sub agents are launched using the Task tool and operate autonomously to complete specific objectives. They return results to the main conversation without cluttering your context.

## Available Agent Types

### Core Agents (Currently Available)
- **general-purpose**: For complex research and multi-step tasks
- **statusline-setup**: Configures Claude Code status line settings
- **output-style-setup**: Creates Claude Code output styles

### Recommended Specialist Agents (Blueprints for Future Implementation)

> **Note**: The following specialized agents are recommended patterns and blueprints for future implementation. They are not currently available in Claude Code but represent best practices for organizing sub-agent capabilities. To use these patterns, you would need to configure custom agents using Markdown files with YAML frontmatter.

### JavaScript/Web Development Specialists
- **react-specialist**: Expert in React, hooks, state management, and component architecture
- **nextjs-specialist**: Specialized in Next.js app router, API routes, SSR/SSG, and deployment
- **typescript-specialist**: TypeScript configuration, type definitions, and advanced typing patterns
- **nodejs-backend**: Node.js APIs, Express, middleware, and server-side JavaScript
- **frontend-optimizer**: Performance optimization, bundling, code splitting, and web vitals
- **css-styling**: Tailwind CSS, styled-components, CSS modules, and responsive design

### Full-Stack & Deployment Specialists
- **auth-integration**: Authentication systems (Clerk, Auth0, NextAuth), session management
- **clerk-expert**: Complete Clerk authentication specialist - setup, configuration, user management, organization features, webhooks, middleware, custom flows, SSO, and all deployment scenarios
- **database-integration**: Database setup, ORMs (Prisma, Drizzle), schema design
- **api-development**: RESTful APIs, GraphQL, API documentation, and testing
- **vercel-deployment**: Vercel deployment, environment variables, edge functions
- **testing-specialist**: Jest, React Testing Library, E2E testing with Playwright/Cypress

### DevOps & Quality Specialists
- **package-manager**: npm/yarn/pnpm configuration, dependency management, monorepos
- **code-quality**: ESLint, Prettier, pre-commit hooks, code formatting standards
- **performance-monitoring**: Analytics, error tracking, performance metrics

### Project Management & Documentation Specialists
- **project-setup**: Project initialization, configuration, and structure optimization
- **documentation-specialist**: Technical documentation, API docs, README creation, and knowledge management
- **deployment-orchestrator**: Multi-platform deployment coordination and CI/CD pipeline management
- **lessons-learned-analyst**: Post-project analysis, knowledge extraction, and best practices documentation

### Specialized Integration Experts
- **environment-config**: Environment variable management, secrets handling, and configuration validation
- **build-optimization**: Build process optimization, bundling strategies, and performance tuning
- **security-auditor**: Security analysis, vulnerability assessment, and compliance validation
- **integration-tester**: End-to-end testing, authentication flow validation, and system integration testing

### Session Management & Archival Specialists
- **session-archiver**: Session archival and summarization specialist for preserving conversations, creating learning-focused summaries, and organizing knowledge for future reference
- **closing-workflow-manager**: Comprehensive closing workflow automation specialist that handles session archival, file synchronization, and project cleanup tasks in a coordinated manner

## Configuration

### Current Implementation
Currently, Claude Code supports three core agent types that are immediately available:
- `general-purpose` - Use this for most complex tasks
- `statusline-setup` - For Claude Code status line configuration
- `output-style-setup` - For output style customization

### Custom Agent Implementation (Future)
Custom specialized agents can potentially be:
- Defined in Markdown files with YAML frontmatter
- Configured at project or user level
- Given custom system prompts and tool access
- Version controlled with your project

### Using the General-Purpose Agent
For tasks requiring specialized knowledge (like the blueprint agents listed above), use the `general-purpose` agent with detailed prompts specifying the expertise needed:

```typescript
// Example: Request Next.js expertise from general-purpose agent
Task({
  subagent_type: "general-purpose",
  description: "Next.js project review",
  prompt: "Act as a Next.js specialist and review this project for..."
})
```

## Usage
Agents can be invoked:
1. **Automatically** - Based on task descriptions matching their expertise
2. **Explicitly** - By directly requesting a specific agent type

## Key Characteristics
- **Purpose**: Operate with separate context windows and provide task-specific expertise
- **Benefits**: Preserve main conversation context, enable specialized problem-solving, offer reusable configurable task handlers
- **Configuration**: Defined in Markdown files with YAML frontmatter, can be project-level or user-level
- **Advanced Features**: Support chaining subagents and dynamic subagent selection

## Best Practices
- Create focused, single-purpose subagents
- Write detailed system prompts
- Limit tool access to what's needed
- Version control project subagents

## Session Archival Configuration

### Local Session Archive Setup
For projects using session archival, create a local `session-archives` folder structure:

```
project-root/
├── session-archives/
│   ├── YYYYMMDDHHLL_archive.md
│   ├── YYYYMMDDHHLL_archive.md
│   └── ...
└── other-project-files...
```

### Session Archive File Naming Convention
- **Format**: `YYYYMMDDHHLL_archive.md`
- **Example**: `202409201600_archive.md` (September 20, 2024, 4:00 PM)
- **Content**: Complete session conversation with metadata and learning summaries

### Session Archiver Usage
```typescript
// Example: Archive current session
Task({
  subagent_type: "session-archiver", // Note: Use general-purpose until custom agents available
  description: "Archive today's session",
  prompt: "Create comprehensive archive of today's session in local session-archives folder using YYYYMMDDHHLL_archive.md naming format. Include complete conversation flow, key insights, and learning outcomes."
})
```

### Archive Content Structure
Each archive file should include:
- **Session metadata**: Date, duration, participants, topics
- **Complete conversation**: Chronological exchanges with user/assistant delineation
- **Key achievements**: Major accomplishments and deliverables
- **Technical insights**: Critical discoveries and learning outcomes
- **Code solutions**: Important snippets with explanations
- **Problem-solution pairs**: Issues encountered and resolutions
- **Future references**: Action items and follow-up suggestions

## Example Use Cases

### Core Development Tasks
- Code reviewer for analyzing code quality
- Debugger for troubleshooting issues
- Data scientist for data analysis tasks
- React component architecture and optimization
- Next.js deployment and configuration
- TypeScript integration and type safety

### Authentication & Security
- Authentication flow implementation
- Complete Clerk deployment and configuration across all environments
- Security vulnerability assessment
- Environment variable validation and secrets management

### Database & API Development
- Database schema design and API creation
- RESTful API development and testing
- GraphQL implementation and optimization

### Performance & Optimization
- Performance optimization and bundle analysis
- Build process optimization and troubleshooting
- CSS styling and responsive design
- Package management and dependency optimization

### Project Management & Documentation
- Project initialization and structure setup
- Technical documentation creation and maintenance
- Lessons learned analysis and knowledge extraction
- Best practices documentation and implementation

### Deployment & Integration
- Multi-platform deployment coordination
- CI/CD pipeline setup and optimization
- Integration testing and validation
- Environment configuration across development, staging, and production

### Specialized Integration Tasks
- Clerk authentication setup and troubleshooting
- Vercel deployment configuration and optimization
- Environment variable management across platforms
- End-to-end testing of authentication flows

### Session Management & Knowledge Preservation
- Session archival with YYYYMMDDHHLL_archive.md naming format
- Comprehensive conversation preservation in local session-archives folder
- Learning-focused summaries for knowledge retention
- Technical insight extraction and documentation
- Project milestone and achievement tracking