"""
Flask to Next.js API Migration Specialist Agent for Claude Code
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent


class FlaskNextJSAPIMigrationSpecialist(BaseAgent):
    """
    Specialized agent for migrating Flask Python APIs to Next.js API routes,
    handling endpoint conversion, middleware migration, and serverless optimization.
    """

    def __init__(self):
        super().__init__(
            agent_type="flask-nextjs-api-migration-specialist",
            description="Specialized agent for migrating Flask Python APIs to Next.js API routes, handling endpoint conversion, middleware migration, and serverless optimization.",
            tools=["Bash", "Glob", "Grep", "Read", "Edit", "MultiEdit", "Write", "NotebookEdit", "WebFetch", "TodoWrite", "WebSearch", "BashOutput", "KillShell"]
        )

    def execute_task(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Execute Flask to Next.js API migration task.

        Args:
            prompt: The migration task description
            **kwargs: Additional parameters for migration

        Returns:
            Dict containing migration results and recommendations
        """
        self.log_activity("Starting Flask to Next.js API migration", {"prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt})

        result = {
            "status": "completed",
            "agent_type": self.agent_type,
            "task_type": "flask_nextjs_api_migration",
            "prompt": prompt,
            "endpoints_analyzed": [],
            "endpoints_migrated": [],
            "middleware_conversions": [],
            "database_adaptations": [],
            "authentication_changes": [],
            "performance_optimizations": [],
            "breaking_changes": [],
            "files_created": [],
            "migration_challenges": [],
            "timestamp": self.created_at.isoformat()
        }

        self.log_activity("Completed Flask API migration analysis", {"endpoints": len(result["endpoints_migrated"])})
        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the agent's Flask API migration capabilities.

        Returns:
            Dict describing migration capabilities and expertise
        """
        return {
            "agent_type": self.agent_type,
            "description": self.description,
            "tools_available": self.tools,
            "migration_expertise": [
                "Flask route to Next.js API route conversion",
                "Python to TypeScript/JavaScript translation",
                "Flask middleware to Next.js middleware migration",
                "Database client migration (SQLAlchemy to Prisma/raw)",
                "Authentication system conversion (Flask-JWT to NextAuth/Clerk)",
                "Request/Response object transformation",
                "Error handling pattern migration",
                "CORS configuration migration",
                "Rate limiting and security middleware",
                "Serverless function optimization"
            ],
            "supported_flask_patterns": [
                "Flask-RESTful APIs",
                "Flask Blueprint organization",
                "Flask-SQLAlchemy database integration",
                "Flask-JWT-Extended authentication",
                "Flask-CORS cross-origin handling",
                "Flask-Migrate database migrations",
                "Custom middleware and decorators",
                "Error handlers and logging"
            ],
            "next_js_targets": [
                "App Router API routes (app/api/)",
                "Pages Router API routes (pages/api/)",
                "Middleware functions",
                "Route handlers with proper HTTP methods",
                "Serverless function optimization",
                "Edge runtime compatibility where applicable"
            ],
            "best_use_cases": [
                "Flask REST APIs to Next.js fullstack apps",
                "Microservice consolidation into Next.js",
                "Python backend modernization to TypeScript",
                "Simplifying deployment from dual-stack to single Next.js",
                "Performance optimization through serverless functions",
                "Reducing infrastructure complexity"
            ],
            "when_to_use": [
                "Migrating Flask APIs to Next.js fullstack architecture",
                "Consolidating separate frontend/backend into single app",
                "Converting Python endpoints to TypeScript/JavaScript",
                "Optimizing for serverless deployment (Vercel, Netlify)",
                "Simplifying development and deployment workflows"
            ]
        }

    def analyze_flask_api(self, flask_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze existing Flask API for migration planning.

        Args:
            flask_config: Flask API configuration and structure

        Returns:
            Dict with comprehensive API analysis
        """
        self.log_activity("Analyzing Flask API", {"endpoints": len(flask_config.get("endpoints", []))})

        # Analysis would examine actual Flask application structure
        analysis = {
            "flask_version": flask_config.get("flask_version", "unknown"),
            "app_structure": flask_config.get("structure", "single_file"),  # single_file, blueprints, factory
            "endpoints_count": len(flask_config.get("endpoints", [])),
            "http_methods_used": flask_config.get("methods", ["GET", "POST"]),
            "middleware_count": len(flask_config.get("middleware", [])),
            "database_integration": flask_config.get("database", "none"),  # sqlalchemy, raw, none
            "authentication_method": flask_config.get("auth", "none"),  # jwt, session, basic, none
            "extensions_used": flask_config.get("extensions", []),
            "custom_decorators": flask_config.get("decorators", []),
            "error_handling": flask_config.get("error_handlers", []),
            "cors_configuration": flask_config.get("cors", {}),
            "migration_complexity": "medium"  # low, medium, high
        }

        # Determine migration strategy
        migration_strategy = self._determine_api_migration_strategy(analysis)

        return {
            "operation": "analyze_flask_api",
            "analysis_results": analysis,
            "migration_strategy": migration_strategy,
            "estimated_effort": self._estimate_api_migration_effort(analysis),
            "recommended_approach": "app_router_api_routes",
            "potential_challenges": self._identify_migration_challenges(analysis),
            "status": "success"
        }

    def _determine_api_migration_strategy(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determine optimal API migration strategy.

        Args:
            analysis: Flask API analysis results

        Returns:
            Dict with migration strategy recommendations
        """
        endpoint_count = analysis.get("endpoints_count", 0)
        complexity = analysis.get("migration_complexity", "medium")
        has_database = analysis.get("database_integration", "none") != "none"

        if endpoint_count <= 10 and complexity == "low":
            return {
                "approach": "direct_conversion",
                "timeline": "1-2 weeks",
                "phases": ["Endpoint Analysis", "Direct Translation", "Testing"],
                "parallel_development": True,
                "recommended_target": "app_router"
            }
        elif endpoint_count <= 30 and complexity in ["low", "medium"]:
            return {
                "approach": "systematic_migration",
                "timeline": "2-4 weeks",
                "phases": ["Core Endpoints", "Authentication", "Database Layer", "Advanced Features", "Testing"],
                "parallel_development": False,
                "recommended_target": "app_router"
            }
        else:
            return {
                "approach": "gradual_replacement",
                "timeline": "1-3 months",
                "phases": ["New Endpoints in Next.js", "Gradual Migration", "Legacy Endpoint Retirement"],
                "parallel_development": True,
                "recommended_target": "hybrid_then_full_nextjs"
            }

    def _estimate_api_migration_effort(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Estimate API migration effort.

        Args:
            analysis: Flask API analysis results

        Returns:
            Dict with effort estimation
        """
        base_effort = 16  # hours for basic setup

        endpoint_factor = analysis.get("endpoints_count", 0) * 1.5
        middleware_factor = len(analysis.get("middleware", [])) * 3
        database_factor = 12 if analysis.get("database_integration", "none") != "none" else 0
        auth_factor = 8 if analysis.get("authentication_method", "none") != "none" else 0
        extensions_factor = len(analysis.get("extensions_used", [])) * 2

        complexity_multiplier = {
            "low": 1.0,
            "medium": 1.3,
            "high": 2.0
        }

        total_hours = (base_effort + endpoint_factor + middleware_factor +
                      database_factor + auth_factor + extensions_factor) * \
                     complexity_multiplier.get(analysis.get("migration_complexity", "medium"), 1.3)

        return {
            "estimated_hours": int(total_hours),
            "estimated_days": int(total_hours / 8),
            "breakdown": {
                "setup_and_config": base_effort,
                "endpoint_migration": endpoint_factor,
                "middleware_conversion": middleware_factor,
                "database_adaptation": database_factor,
                "authentication_migration": auth_factor,
                "extensions_handling": extensions_factor
            }
        }

    def _identify_migration_challenges(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Identify potential migration challenges.

        Args:
            analysis: Flask API analysis results

        Returns:
            List of potential challenges and solutions
        """
        challenges = []

        if analysis.get("database_integration") == "sqlalchemy":
            challenges.append({
                "challenge": "SQLAlchemy ORM Migration",
                "description": "Complex ORM relationships and queries need translation",
                "solution": "Use Prisma or raw database clients with connection pooling",
                "complexity": "high"
            })

        if analysis.get("authentication_method") == "jwt":
            challenges.append({
                "challenge": "JWT Authentication Migration",
                "description": "Flask-JWT patterns differ from Next.js auth solutions",
                "solution": "Migrate to NextAuth.js or Clerk for better integration",
                "complexity": "medium"
            })

        if len(analysis.get("extensions_used", [])) > 5:
            challenges.append({
                "challenge": "Multiple Flask Extensions",
                "description": "Many Flask extensions don't have direct Next.js equivalents",
                "solution": "Find equivalent npm packages or implement custom solutions",
                "complexity": "high"
            })

        return challenges

    def migrate_flask_endpoints(self, endpoint_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert Flask endpoints to Next.js API routes.

        Args:
            endpoint_config: Flask endpoint configuration

        Returns:
            Dict with endpoint migration details
        """
        self.log_activity("Migrating Flask endpoints", {"endpoints": len(endpoint_config.get("endpoints", []))})

        endpoints = endpoint_config.get("endpoints", [])
        target_architecture = endpoint_config.get("target", "app_router")

        # Endpoint conversion patterns
        conversion_patterns = {
            "flask_to_nextjs_app_router": {
                "route_mapping": {
                    "@app.route('/api/users', methods=['GET'])": "app/api/users/route.ts -> export async function GET()",
                    "@app.route('/api/users/<int:id>', methods=['GET'])": "app/api/users/[id]/route.ts -> export async function GET(request, { params })",
                    "@app.route('/api/users', methods=['POST'])": "app/api/users/route.ts -> export async function POST(request)",
                    "@app.route('/api/users/<int:id>', methods=['PUT'])": "app/api/users/[id]/route.ts -> export async function PUT(request, { params })",
                    "@app.route('/api/users/<int:id>', methods=['DELETE'])": "app/api/users/[id]/route.ts -> export async function DELETE(request, { params })"
                },
                "parameter_handling": {
                    "flask_pattern": "request.args.get('param')",
                    "nextjs_pattern": "new URL(request.url).searchParams.get('param')"
                },
                "request_body": {
                    "flask_pattern": "request.json",
                    "nextjs_pattern": "await request.json()"
                },
                "response_format": {
                    "flask_pattern": "return jsonify({'data': data})",
                    "nextjs_pattern": "return Response.json({ data })"
                }
            },
            "middleware_conversion": {
                "flask_before_request": "Next.js middleware.ts",
                "flask_decorators": "Higher-order functions or middleware",
                "cors_handling": "Built-in Next.js CORS or middleware",
                "authentication_check": "Middleware or route-level auth validation"
            }
        }

        return {
            "operation": "migrate_flask_endpoints",
            "endpoints_count": len(endpoints),
            "target_architecture": target_architecture,
            "conversion_patterns": conversion_patterns,
            "migration_examples": self._generate_migration_examples(),
            "status": "success"
        }

    def _generate_migration_examples(self) -> Dict[str, Any]:
        """
        Generate example migrations for common Flask patterns.

        Returns:
            Dict with before/after code examples
        """
        return {
            "simple_get_endpoint": {
                "flask_code": '''
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])
                ''',
                "nextjs_code": '''
// app/api/users/route.ts
export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}
                '''
            },
            "post_with_validation": {
                "flask_code": '''
@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    if not data.get('email'):
        return jsonify({'error': 'Email required'}), 400

    user = User(email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201
                ''',
                "nextjs_code": '''
// app/api/users/route.ts
export async function POST(request: Request) {
  const data = await request.json();

  if (!data.email) {
    return Response.json({ error: 'Email required' }, { status: 400 });
  }

  const user = await db.user.create({
    data: { email: data.email }
  });

  return Response.json(user, { status: 201 });
}
                '''
            },
            "authenticated_endpoint": {
                "flask_code": '''
@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'user': current_user})
                ''',
                "nextjs_code": '''
// app/api/protected/route.ts
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ user: session.user });
}
                '''
            }
        }

    def migrate_database_layer(self, database_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Migrate Flask database integration to Next.js compatible solution.

        Args:
            database_config: Database configuration details

        Returns:
            Dict with database migration plan
        """
        self.log_activity("Migrating database layer", {"db_type": database_config.get("type")})

        current_orm = database_config.get("orm", "sqlalchemy")
        database_type = database_config.get("type", "postgresql")
        has_migrations = database_config.get("migrations", False)

        # Database migration strategies
        migration_strategies = {
            "sqlalchemy_to_prisma": {
                "benefits": [
                    "Type-safe database access",
                    "Built-in migrations",
                    "Excellent TypeScript integration",
                    "Connection pooling support"
                ],
                "migration_steps": [
                    "Install Prisma CLI and client",
                    "Generate Prisma schema from existing database",
                    "Replace SQLAlchemy queries with Prisma queries",
                    "Set up connection pooling for serverless",
                    "Migrate existing migrations to Prisma"
                ],
                "connection_example": '''
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
                '''
            },
            "sqlalchemy_to_raw_client": {
                "benefits": [
                    "Direct control over queries",
                    "Lighter weight",
                    "Flexible query building"
                ],
                "challenges": [
                    "No built-in migrations",
                    "Manual type safety",
                    "More boilerplate code"
                ],
                "recommended_clients": {
                    "postgresql": "@neondatabase/serverless or pg",
                    "mysql": "mysql2",
                    "sqlite": "better-sqlite3"
                }
            }
        }

        recommended_strategy = f"{current_orm}_to_prisma"
        selected_strategy = migration_strategies.get(recommended_strategy, migration_strategies["sqlalchemy_to_prisma"])

        return {
            "operation": "migrate_database_layer",
            "current_orm": current_orm,
            "database_type": database_type,
            "recommended_approach": "prisma",
            "migration_strategy": selected_strategy,
            "serverless_considerations": [
                "Connection pooling is essential",
                "Cold start optimization",
                "Connection limit management",
                "Environment variable configuration"
            ],
            "status": "success"
        }

    def optimize_for_serverless(self, optimization_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize migrated API for serverless deployment.

        Args:
            optimization_config: Optimization configuration

        Returns:
            Dict with serverless optimization recommendations
        """
        self.log_activity("Optimizing for serverless", {"endpoints": len(optimization_config.get("endpoints", []))})

        # Serverless optimization strategies
        optimizations = {
            "cold_start_mitigation": {
                "techniques": [
                    "Minimize bundle size",
                    "Lazy load heavy dependencies",
                    "Use edge runtime where possible",
                    "Implement connection pooling",
                    "Optimize imports"
                ],
                "implementation": '''
// Use dynamic imports for heavy libraries
const heavyLibrary = await import('heavy-library');

// Edge runtime for simple operations
export const runtime = 'edge';
                '''
            },
            "database_connections": {
                "best_practices": [
                    "Use connection pooling",
                    "Implement connection reuse",
                    "Set appropriate timeouts",
                    "Handle connection errors gracefully"
                ],
                "recommended_clients": [
                    "@neondatabase/serverless",
                    "@planetscale/database",
                    "Supabase client"
                ]
            },
            "error_handling": {
                "patterns": [
                    "Graceful degradation",
                    "Proper HTTP status codes",
                    "Structured error responses",
                    "Logging and monitoring"
                ],
                "example": '''
export async function GET() {
  try {
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
                '''
            },
            "caching_strategies": {
                "techniques": [
                    "HTTP caching headers",
                    "Next.js revalidation",
                    "Redis caching layer",
                    "CDN optimization"
                ]
            }
        }

        return {
            "operation": "optimize_for_serverless",
            "optimization_areas": list(optimizations.keys()),
            "optimizations": optimizations,
            "performance_targets": {
                "cold_start": "< 1s",
                "response_time": "< 200ms",
                "memory_usage": "< 128MB"
            },
            "monitoring_recommendations": [
                "Function execution time",
                "Memory usage",
                "Error rates",
                "Database connection metrics"
            ],
            "status": "success"
        }