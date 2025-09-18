"""
React to Next.js Migration Specialist Agent for Claude Code
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent


class ReactNextJSMigrationSpecialist(BaseAgent):
    """
    Specialized agent for migrating React applications (CRA, Vite) to Next.js 14,
    handling component migration, routing changes, and build optimization.
    """

    def __init__(self):
        super().__init__(
            agent_type="react-nextjs-migration-specialist",
            description="Specialized agent for migrating React applications to Next.js 14, handling component migration, routing changes, and build optimization.",
            tools=["Bash", "Glob", "Grep", "Read", "Edit", "MultiEdit", "Write", "NotebookEdit", "WebFetch", "TodoWrite", "WebSearch", "BashOutput", "KillShell"]
        )

    def execute_task(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Execute React to Next.js migration task.

        Args:
            prompt: The migration task description
            **kwargs: Additional parameters for migration

        Returns:
            Dict containing migration results and recommendations
        """
        self.log_activity("Starting React to Next.js migration", {"prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt})

        result = {
            "status": "completed",
            "agent_type": self.agent_type,
            "task_type": "react_nextjs_migration",
            "prompt": prompt,
            "migration_analysis": {},
            "components_migrated": [],
            "routing_changes": [],
            "dependency_updates": [],
            "build_config_changes": [],
            "performance_improvements": [],
            "breaking_changes": [],
            "files_modified": [],
            "migration_steps": [],
            "timestamp": self.created_at.isoformat()
        }

        self.log_activity("Completed React migration analysis", {"components": len(result["components_migrated"])})
        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the agent's React migration capabilities.

        Returns:
            Dict describing migration capabilities and expertise
        """
        return {
            "agent_type": self.agent_type,
            "description": self.description,
            "tools_available": self.tools,
            "migration_expertise": [
                "Create React App (CRA) to Next.js migration",
                "Vite React to Next.js migration",
                "React Router to Next.js App Router migration",
                "Component structure adaptation",
                "State management migration (Redux, Context)",
                "Build configuration translation",
                "Environment variable migration",
                "Asset optimization and migration",
                "Testing setup migration",
                "Deployment configuration updates"
            ],
            "supported_source_frameworks": [
                "Create React App (CRA)",
                "Vite + React",
                "React + Webpack",
                "React + Parcel",
                "Gatsby (partial)",
                "Custom React setups"
            ],
            "migration_patterns": [
                "Pages Router migration",
                "App Router migration (recommended)",
                "Hybrid migration approach",
                "Incremental migration strategy",
                "Component-by-component migration"
            ],
            "best_use_cases": [
                "CRA applications with React Router",
                "Large React applications needing SSR/SSG",
                "React apps requiring better SEO",
                "Applications needing API routes",
                "React projects wanting Vercel optimization",
                "Multi-page React applications"
            ],
            "when_to_use": [
                "Migrating from Create React App to Next.js",
                "Converting SPA to fullstack application",
                "Adding SSR/SSG capabilities to React app",
                "Modernizing legacy React applications",
                "Optimizing React app performance",
                "Simplifying deployment and build processes"
            ]
        }

    def analyze_react_project(self, project_path: str) -> Dict[str, Any]:
        """
        Analyze existing React project for migration planning.

        Args:
            project_path: Path to the React project to analyze

        Returns:
            Dict with comprehensive project analysis
        """
        self.log_activity("Analyzing React project", {"path": project_path})

        # Analysis would examine actual project structure
        analysis = {
            "project_type": "unknown",  # CRA, Vite, custom
            "react_version": "unknown",
            "routing_library": "unknown",  # react-router-dom, reach-router, none
            "state_management": [],  # redux, context, zustand, etc.
            "styling_solution": "unknown",  # CSS modules, styled-components, emotion, etc.
            "build_tool": "unknown",  # webpack, vite, parcel
            "testing_framework": "unknown",  # jest, vitest, cypress
            "dependencies_count": 0,
            "components_count": 0,
            "pages_count": 0,
            "api_calls": [],
            "environment_variables": [],
            "build_scripts": {},
            "migration_complexity": "medium"  # low, medium, high
        }

        # Determine migration strategy based on analysis
        migration_strategy = self._determine_migration_strategy(analysis)

        return {
            "operation": "analyze_react_project",
            "project_path": project_path,
            "analysis_results": analysis,
            "migration_strategy": migration_strategy,
            "estimated_effort": self._estimate_migration_effort(analysis),
            "recommended_approach": "app_router" if analysis.get("react_version", "16") >= "18" else "pages_router",
            "status": "success"
        }

    def _determine_migration_strategy(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determine optimal migration strategy based on project analysis.

        Args:
            analysis: Project analysis results

        Returns:
            Dict with migration strategy recommendations
        """
        complexity = analysis.get("migration_complexity", "medium")
        has_routing = analysis.get("routing_library") != "none"
        component_count = analysis.get("components_count", 0)

        if complexity == "low" and component_count < 20:
            return {
                "approach": "complete_migration",
                "timeline": "1-2 weeks",
                "phases": ["Setup", "Component Migration", "Testing"],
                "risks": ["Low"],
                "recommended_target": "app_router"
            }
        elif complexity == "medium" or (component_count >= 20 and component_count < 100):
            return {
                "approach": "phased_migration",
                "timeline": "2-4 weeks",
                "phases": ["Setup", "Core Components", "Routing Migration", "Feature Components", "Testing"],
                "risks": ["Medium"],
                "recommended_target": "app_router"
            }
        else:
            return {
                "approach": "incremental_migration",
                "timeline": "1-3 months",
                "phases": ["Setup", "New Features in Next.js", "Gradual Component Migration", "Complete Migration"],
                "risks": ["High - requires careful planning"],
                "recommended_target": "pages_router_first_then_app_router"
            }

    def _estimate_migration_effort(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Estimate migration effort based on project characteristics.

        Args:
            analysis: Project analysis results

        Returns:
            Dict with effort estimation
        """
        base_effort = 40  # hours
        complexity_multiplier = {
            "low": 1.0,
            "medium": 1.5,
            "high": 2.5
        }

        component_factor = min(analysis.get("components_count", 0) * 0.5, 20)
        routing_factor = 8 if analysis.get("routing_library") != "none" else 0
        state_mgmt_factor = len(analysis.get("state_management", [])) * 4

        total_hours = (base_effort + component_factor + routing_factor + state_mgmt_factor) * \
                     complexity_multiplier.get(analysis.get("migration_complexity", "medium"), 1.5)

        return {
            "estimated_hours": int(total_hours),
            "estimated_days": int(total_hours / 8),
            "factors": {
                "base_effort": base_effort,
                "component_complexity": component_factor,
                "routing_complexity": routing_factor,
                "state_management_complexity": state_mgmt_factor,
                "complexity_multiplier": complexity_multiplier.get(analysis.get("migration_complexity", "medium"), 1.5)
            }
        }

    def migrate_routing_system(self, routing_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Migrate React Router to Next.js routing system.

        Args:
            routing_config: Current routing configuration

        Returns:
            Dict with routing migration plan
        """
        self.log_activity("Migrating routing system", {"routes_count": len(routing_config.get("routes", []))})

        current_router = routing_config.get("library", "react-router-dom")
        routes = routing_config.get("routes", [])
        target_router = routing_config.get("target", "app_router")

        # Routing migration patterns
        migration_patterns = {
            "react-router-dom_to_app_router": {
                "route_mapping": {
                    "/": "app/page.tsx",
                    "/about": "app/about/page.tsx",
                    "/users/:id": "app/users/[id]/page.tsx",
                    "/posts/:category/:slug": "app/posts/[category]/[slug]/page.tsx",
                    "/dashboard/*": "app/dashboard/[...slug]/page.tsx"
                },
                "component_changes": [
                    "Remove <BrowserRouter>",
                    "Remove <Routes> and <Route>",
                    "Convert route components to page.tsx files",
                    "Add loading.tsx and error.tsx for enhanced UX",
                    "Implement layout.tsx for shared layouts"
                ],
                "hook_migrations": {
                    "useNavigate()": "useRouter().push()",
                    "useLocation()": "usePathname() / useSearchParams()",
                    "useParams()": "Dynamic route params as props"
                }
            },
            "react-router-dom_to_pages_router": {
                "route_mapping": {
                    "/": "pages/index.tsx",
                    "/about": "pages/about.tsx",
                    "/users/:id": "pages/users/[id].tsx",
                    "/posts/:category/:slug": "pages/posts/[category]/[slug].tsx",
                    "/dashboard/*": "pages/dashboard/[...slug].tsx"
                },
                "component_changes": [
                    "Remove <BrowserRouter>",
                    "Remove <Routes> and <Route>",
                    "Convert route components to page files",
                    "Use _app.tsx for global layouts",
                    "Use _document.tsx for HTML structure"
                ]
            }
        }

        selected_pattern = f"{current_router}_to_{target_router}"
        migration_plan = migration_patterns.get(selected_pattern, migration_patterns["react-router-dom_to_app_router"])

        return {
            "operation": "migrate_routing_system",
            "source_router": current_router,
            "target_router": target_router,
            "routes_to_migrate": len(routes),
            "migration_plan": migration_plan,
            "breaking_changes": [
                "Route component structure changes",
                "Navigation hook changes",
                "Parameter passing changes",
                "Layout implementation changes"
            ],
            "status": "success"
        }

    def migrate_components(self, component_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Migrate React components for Next.js compatibility.

        Args:
            component_config: Component migration configuration

        Returns:
            Dict with component migration details
        """
        self.log_activity("Migrating components", {"components": len(component_config.get("components", []))})

        components = component_config.get("components", [])
        target_architecture = component_config.get("target", "app_router")

        # Component migration considerations
        migration_considerations = {
            "client_components": {
                "indicators": [
                    "useState, useEffect, useContext usage",
                    "Event handlers (onClick, onSubmit)",
                    "Browser-only APIs (localStorage, window)",
                    "Third-party client-side libraries"
                ],
                "migration": "Add 'use client' directive at top of file",
                "implications": "Rendered on client side, loses server-side benefits"
            },
            "server_components": {
                "indicators": [
                    "Data fetching without client state",
                    "Database queries",
                    "File system access",
                    "Environment variable access"
                ],
                "migration": "Default in App Router, no directive needed",
                "benefits": "Better performance, SEO, and security"
            },
            "layout_components": {
                "migration_target": "layout.tsx files",
                "nesting": "Supports nested layouts",
                "shared_state": "Use React Context or external state management"
            },
            "styling_migration": {
                "css_modules": "Fully supported, no changes needed",
                "styled_components": "Requires configuration for SSR",
                "emotion": "Requires configuration for SSR",
                "tailwind": "Fully supported with minimal configuration"
            }
        }

        return {
            "operation": "migrate_components",
            "components_count": len(components),
            "target_architecture": target_architecture,
            "migration_considerations": migration_considerations,
            "recommended_changes": [
                "Identify client vs server component needs",
                "Add 'use client' directive where needed",
                "Convert layouts to layout.tsx files",
                "Update import paths if necessary",
                "Configure styling solution for SSR"
            ],
            "status": "success"
        }

    def migrate_build_configuration(self, build_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Migrate build configuration from React to Next.js.

        Args:
            build_config: Current build configuration

        Returns:
            Dict with build migration plan
        """
        self.log_activity("Migrating build configuration", {"config_type": build_config.get("type")})

        source_build_tool = build_config.get("type", "cra")  # cra, vite, webpack
        custom_webpack_config = build_config.get("webpack_config", {})
        environment_variables = build_config.get("env_vars", [])

        # Build configuration migration
        migration_mapping = {
            "cra": {
                "package_json_changes": {
                    "remove_scripts": ["eject"],
                    "update_scripts": {
                        "dev": "next dev",
                        "build": "next build",
                        "start": "next start",
                        "lint": "next lint"
                    },
                    "remove_dependencies": ["react-scripts"],
                    "add_dependencies": ["next", "@types/node"]
                },
                "configuration_files": {
                    "remove": ["public/manifest.json", "src/setupTests.js"],
                    "create": ["next.config.js", "middleware.ts"],
                    "modify": ["tsconfig.json", ".gitignore"]
                },
                "environment_variables": {
                    "prefix_change": "REACT_APP_ -> NEXT_PUBLIC_",
                    "server_only": "Variables without NEXT_PUBLIC_ are server-only"
                }
            },
            "vite": {
                "package_json_changes": {
                    "remove_dependencies": ["vite", "@vitejs/plugin-react"],
                    "add_dependencies": ["next"],
                    "update_scripts": {
                        "dev": "next dev",
                        "build": "next build",
                        "preview": "next start"
                    }
                },
                "configuration_files": {
                    "remove": ["vite.config.ts", "index.html"],
                    "create": ["next.config.js"],
                    "migrate": "src/main.tsx content to app/layout.tsx"
                }
            }
        }

        selected_migration = migration_mapping.get(source_build_tool, migration_mapping["cra"])

        return {
            "operation": "migrate_build_configuration",
            "source_build_tool": source_build_tool,
            "migration_plan": selected_migration,
            "webpack_customizations": len(custom_webpack_config) > 0,
            "env_variables_to_migrate": len(environment_variables),
            "next_config_needed": bool(custom_webpack_config),
            "status": "success"
        }