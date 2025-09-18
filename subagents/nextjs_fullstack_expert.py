"""
Next.js 14 Fullstack Expert Agent for Claude Code
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent


class NextJSFullstackExpert(BaseAgent):
    """
    Expert agent specialized in Next.js 14 fullstack application development,
    architecture, and best practices for modern React applications.
    """

    def __init__(self):
        super().__init__(
            agent_type="nextjs-fullstack-expert",
            description="Expert agent specialized in Next.js 14 fullstack application development, architecture, and best practices for modern React applications.",
            tools=["Bash", "Glob", "Grep", "Read", "Edit", "MultiEdit", "Write", "NotebookEdit", "WebFetch", "TodoWrite", "WebSearch", "BashOutput", "KillShell"]
        )

    def execute_task(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Execute Next.js 14 development task.

        Args:
            prompt: The development task description
            **kwargs: Additional parameters for the task

        Returns:
            Dict containing development results and recommendations
        """
        self.log_activity("Starting Next.js 14 fullstack task", {"prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt})

        result = {
            "status": "completed",
            "agent_type": self.agent_type,
            "task_type": "nextjs_fullstack_development",
            "prompt": prompt,
            "architecture_recommendations": [],
            "components_created": [],
            "api_routes_implemented": [],
            "performance_optimizations": [],
            "security_considerations": [],
            "deployment_configs": [],
            "files_modified": [],
            "best_practices_applied": [],
            "timestamp": self.created_at.isoformat()
        }

        self.log_activity("Completed Next.js 14 task", {"components": len(result["components_created"])})
        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the agent's Next.js 14 fullstack capabilities.

        Returns:
            Dict describing capabilities and specializations
        """
        return {
            "agent_type": self.agent_type,
            "description": self.description,
            "tools_available": self.tools,
            "specializations": [
                "Next.js 14 App Router architecture",
                "React Server Components implementation",
                "API Routes with serverless optimization",
                "TypeScript integration and type safety",
                "Tailwind CSS and modern styling",
                "Authentication (NextAuth, Clerk)",
                "Database integration (PostgreSQL, MongoDB)",
                "State management (Zustand, React Query)",
                "Performance optimization (ISR, SSG, SSR)",
                "Deployment optimization for Vercel",
                "Security best practices",
                "Testing strategies (Jest, Playwright)"
            ],
            "best_use_cases": [
                "Next.js 14 project setup and architecture design",
                "App Router migration from Pages Router",
                "React Server Components implementation",
                "API route development and optimization",
                "Database integration and connection pooling",
                "Authentication system implementation",
                "Performance optimization and bundle analysis",
                "Vercel deployment configuration",
                "Type-safe fullstack development",
                "Modern React patterns and best practices"
            ],
            "when_to_use": [
                "Building new Next.js 14 applications",
                "Migrating from Create React App to Next.js",
                "Implementing fullstack features with API routes",
                "Optimizing Next.js applications for production",
                "Setting up modern development workflows",
                "Integrating third-party services and APIs"
            ],
            "framework_expertise": {
                "nextjs_version": "14.x",
                "react_version": "18.x",
                "typescript_support": "full",
                "styling_solutions": ["Tailwind CSS", "ShadCN", "CSS Modules", "Styled Components"],
                "auth_providers": ["NextAuth.js", "Clerk", "Auth0", "Supabase Auth"],
                "databases": ["PostgreSQL", "MongoDB", "Supabase", "PlanetScale", "Vercel Postgres"],
                "deployment_platforms": ["Vercel", "Netlify", "Railway", "Docker"]
            }
        }

    def create_nextjs_project_structure(self, project_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create optimal Next.js 14 project structure.

        Args:
            project_config: Configuration for the project setup

        Returns:
            Dict with project structure recommendations
        """
        self.log_activity("Creating Next.js project structure", {"config": project_config})

        project_name = project_config.get("name", "nextjs-app")
        use_typescript = project_config.get("typescript", True)
        use_tailwind = project_config.get("tailwind", True)
        use_app_router = project_config.get("app_router", True)

        # Recommended project structure for Next.js 14
        structure = {
            "root_files": [
                "package.json",
                "next.config.js",
                "tailwind.config.ts" if use_tailwind else None,
                "tsconfig.json" if use_typescript else "jsconfig.json",
                ".env.local",
                ".env.example",
                ".gitignore",
                "README.md"
            ],
            "app_directory": {
                "layout.tsx": "Root layout component",
                "page.tsx": "Home page",
                "globals.css": "Global styles",
                "api/": "API routes directory",
                "components/": "Reusable components",
                "lib/": "Utility functions and configurations",
                "types/": "TypeScript type definitions",
                "(auth)/": "Route groups for authentication",
                "dashboard/": "Protected dashboard routes"
            } if use_app_router else None,
            "pages_directory": {
                "_app.tsx": "App component",
                "_document.tsx": "Document component",
                "index.tsx": "Home page",
                "api/": "API routes directory"
            } if not use_app_router else None,
            "additional_directories": [
                "components/ui/",
                "hooks/",
                "utils/",
                "config/",
                "middleware.ts"
            ]
        }

        # Filter out None values
        structure["root_files"] = [f for f in structure["root_files"] if f is not None]

        return {
            "operation": "create_nextjs_project_structure",
            "project_name": project_name,
            "configuration": {
                "typescript": use_typescript,
                "tailwind": use_tailwind,
                "app_router": use_app_router
            },
            "recommended_structure": structure,
            "status": "success"
        }

    def implement_api_routes(self, api_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implement Next.js API routes with best practices.

        Args:
            api_config: Configuration for API implementation

        Returns:
            Dict with API implementation details
        """
        self.log_activity("Implementing API routes", {"endpoints": len(api_config.get("endpoints", []))})

        endpoints = api_config.get("endpoints", [])
        use_middleware = api_config.get("middleware", True)
        auth_required = api_config.get("auth_required", [])

        # API route patterns and best practices
        implementation_patterns = {
            "route_handler_format": "app/api/[endpoint]/route.ts",
            "http_methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
            "middleware_chain": [
                "CORS handling",
                "Authentication validation",
                "Rate limiting",
                "Request validation",
                "Error handling",
                "Response formatting"
            ],
            "security_measures": [
                "Input sanitization",
                "SQL injection prevention",
                "XSS protection",
                "CSRF tokens",
                "Request size limits",
                "API key validation"
            ],
            "performance_optimizations": [
                "Connection pooling",
                "Response caching",
                "Compression",
                "Edge runtime where applicable",
                "Database query optimization"
            ]
        }

        return {
            "operation": "implement_api_routes",
            "endpoints_count": len(endpoints),
            "auth_protected_routes": len(auth_required),
            "implementation_patterns": implementation_patterns,
            "recommended_middleware": use_middleware,
            "status": "success"
        }

    def setup_database_integration(self, db_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Set up database integration with connection pooling.

        Args:
            db_config: Database configuration details

        Returns:
            Dict with database setup specifications
        """
        self.log_activity("Setting up database integration", {"db_type": db_config.get("type")})

        db_type = db_config.get("type", "postgresql")
        use_orm = db_config.get("orm", "prisma")
        connection_pooling = db_config.get("pooling", True)

        # Database integration patterns
        integration_config = {
            "postgresql": {
                "recommended_client": "pg" if use_orm == "raw" else "prisma",
                "connection_string_format": "postgresql://user:password@host:port/database",
                "pooling_library": "@neondatabase/serverless" if connection_pooling else "pg",
                "environment_variables": ["DATABASE_URL", "DATABASE_POOL_URL"]
            },
            "mongodb": {
                "recommended_client": "mongoose" if use_orm == "mongoose" else "mongodb",
                "connection_string_format": "mongodb+srv://user:password@cluster/database",
                "pooling_options": {"maxPoolSize": 10, "serverSelectionTimeoutMS": 5000},
                "environment_variables": ["MONGODB_URI"]
            },
            "supabase": {
                "recommended_client": "@supabase/supabase-js",
                "connection_setup": "createClient with service role key",
                "auth_integration": "Built-in authentication",
                "environment_variables": ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]
            }
        }

        selected_config = integration_config.get(db_type, integration_config["postgresql"])

        return {
            "operation": "setup_database_integration",
            "database_type": db_type,
            "orm_choice": use_orm,
            "connection_pooling": connection_pooling,
            "configuration": selected_config,
            "serverless_optimizations": [
                "Connection reuse",
                "Cold start mitigation",
                "Query optimization",
                "Connection timeout handling"
            ],
            "status": "success"
        }

    def implement_authentication(self, auth_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implement authentication system with modern providers.

        Args:
            auth_config: Authentication configuration

        Returns:
            Dict with authentication implementation details
        """
        self.log_activity("Implementing authentication", {"provider": auth_config.get("provider")})

        provider = auth_config.get("provider", "nextauth")
        protected_routes = auth_config.get("protected_routes", [])
        user_roles = auth_config.get("roles", [])

        # Authentication implementation patterns
        auth_implementations = {
            "nextauth": {
                "installation": "next-auth",
                "configuration_file": "app/api/auth/[...nextauth]/route.ts",
                "middleware_file": "middleware.ts",
                "providers": ["Google", "GitHub", "Discord", "Credentials"],
                "session_strategy": "jwt",
                "callbacks": ["jwt", "session", "signIn"],
                "environment_variables": [
                    "NEXTAUTH_URL",
                    "NEXTAUTH_SECRET",
                    "GOOGLE_CLIENT_ID",
                    "GOOGLE_CLIENT_SECRET"
                ]
            },
            "clerk": {
                "installation": "@clerk/nextjs",
                "configuration_file": "app/layout.tsx",
                "middleware_file": "middleware.ts",
                "features": ["User management", "Organizations", "Multi-factor auth"],
                "components": ["SignIn", "SignUp", "UserProfile"],
                "environment_variables": [
                    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
                    "CLERK_SECRET_KEY"
                ]
            },
            "supabase": {
                "installation": "@supabase/supabase-js",
                "configuration_file": "lib/supabase.ts",
                "auth_helpers": "@supabase/auth-helpers-nextjs",
                "features": ["Email auth", "Social providers", "Row Level Security"],
                "environment_variables": [
                    "NEXT_PUBLIC_SUPABASE_URL",
                    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
                ]
            }
        }

        selected_auth = auth_implementations.get(provider, auth_implementations["nextauth"])

        return {
            "operation": "implement_authentication",
            "provider": provider,
            "protected_routes_count": len(protected_routes),
            "user_roles": user_roles,
            "implementation_details": selected_auth,
            "security_features": [
                "CSRF protection",
                "Session management",
                "Secure cookies",
                "Route protection middleware",
                "Role-based access control"
            ],
            "status": "success"
        }

    def optimize_performance(self, optimization_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implement Next.js performance optimizations.

        Args:
            optimization_config: Performance optimization settings

        Returns:
            Dict with optimization recommendations
        """
        self.log_activity("Optimizing performance", {"targets": optimization_config.get("targets", [])})

        targets = optimization_config.get("targets", ["bundle_size", "loading_speed", "seo"])
        enable_analytics = optimization_config.get("analytics", True)

        # Performance optimization strategies
        optimizations = {
            "bundle_size": {
                "techniques": [
                    "Tree shaking",
                    "Dynamic imports",
                    "Bundle analyzer",
                    "Unused code elimination"
                ],
                "tools": ["@next/bundle-analyzer", "webpack-bundle-analyzer"],
                "next_config_options": ["experimental.optimizePackageImports"]
            },
            "loading_speed": {
                "techniques": [
                    "Static Site Generation (SSG)",
                    "Incremental Static Regeneration (ISR)",
                    "Server-Side Rendering (SSR)",
                    "Image optimization",
                    "Font optimization"
                ],
                "components": ["next/image", "next/font"],
                "caching_strategies": ["HTTP caching", "SWR", "React Query"]
            },
            "seo": {
                "techniques": [
                    "Metadata API",
                    "Open Graph tags",
                    "Structured data",
                    "Sitemap generation"
                ],
                "next_features": ["generateMetadata", "robots.txt", "sitemap.xml"],
                "tools": ["@next/seo", "next-sitemap"]
            },
            "runtime_performance": {
                "techniques": [
                    "React Server Components",
                    "Streaming",
                    "Suspense boundaries",
                    "Edge runtime"
                ],
                "monitoring": ["Vercel Analytics", "Web Vitals", "Lighthouse CI"]
            }
        }

        return {
            "operation": "optimize_performance",
            "optimization_targets": targets,
            "analytics_enabled": enable_analytics,
            "optimization_strategies": {target: optimizations[target] for target in targets if target in optimizations},
            "recommended_monitoring": [
                "Core Web Vitals",
                "Bundle size tracking",
                "Performance budgets",
                "Lighthouse scores"
            ],
            "status": "success"
        }