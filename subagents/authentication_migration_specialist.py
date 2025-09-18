"""
Authentication Migration Specialist Agent for Claude Code
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent


class AuthenticationMigrationSpecialist(BaseAgent):
    """
    Specialized agent for migrating authentication systems from Flask-JWT/session-based
    to modern Next.js authentication solutions (NextAuth, Clerk, Supabase Auth).
    """

    def __init__(self):
        super().__init__(
            agent_type="authentication-migration-specialist",
            description="Specialized agent for migrating authentication systems to modern Next.js authentication solutions.",
            tools=["Bash", "Glob", "Grep", "Read", "Edit", "MultiEdit", "Write", "NotebookEdit", "WebFetch", "TodoWrite", "WebSearch", "BashOutput", "KillShell"]
        )

    def execute_task(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Execute authentication migration task.

        Args:
            prompt: The migration task description
            **kwargs: Additional parameters for migration

        Returns:
            Dict containing migration results and recommendations
        """
        self.log_activity("Starting authentication migration", {"prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt})

        result = {
            "status": "completed",
            "agent_type": self.agent_type,
            "task_type": "authentication_migration",
            "prompt": prompt,
            "current_auth_analysis": {},
            "target_auth_system": "",
            "migration_plan": {},
            "user_data_migration": {},
            "security_improvements": [],
            "route_protection_updates": [],
            "middleware_changes": [],
            "breaking_changes": [],
            "testing_requirements": [],
            "files_modified": [],
            "timestamp": self.created_at.isoformat()
        }

        self.log_activity("Completed authentication migration analysis", {"target_system": result["target_auth_system"]})
        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the agent's authentication migration capabilities.

        Returns:
            Dict describing migration capabilities and expertise
        """
        return {
            "agent_type": self.agent_type,
            "description": self.description,
            "tools_available": self.tools,
            "migration_expertise": [
                "Flask-JWT-Extended to NextAuth.js migration",
                "Flask-Login to Clerk.dev migration",
                "Session-based auth to modern OAuth migration",
                "Custom JWT implementation to standard solutions",
                "User database schema migration",
                "Role-based access control migration",
                "Password reset flow migration",
                "Social authentication integration",
                "Multi-factor authentication setup",
                "Security enhancement implementation"
            ],
            "supported_source_systems": [
                "Flask-JWT-Extended",
                "Flask-Login with sessions",
                "Custom Flask JWT implementation",
                "Flask-Security",
                "Flask-Principal (authorization)",
                "Basic Authentication",
                "API Key authentication",
                "OAuth implementations"
            ],
            "target_auth_solutions": [
                "NextAuth.js (most flexible)",
                "Clerk.dev (easiest setup)",
                "Supabase Auth (full backend)",
                "Auth0 (enterprise features)",
                "Firebase Auth (Google ecosystem)",
                "AWS Cognito (AWS integration)"
            ],
            "migration_features": [
                "User data preservation",
                "Password migration (where possible)",
                "Role and permission mapping",
                "Social login integration",
                "Route protection implementation",
                "Session management migration",
                "Security best practices application",
                "Multi-step migration process"
            ],
            "best_use_cases": [
                "Flask-JWT to NextAuth.js migration",
                "Simplifying authentication architecture",
                "Adding social login capabilities",
                "Improving security posture",
                "Modernizing user management",
                "Consolidating authentication logic"
            ],
            "when_to_use": [
                "Migrating from Flask backend authentication",
                "Consolidating frontend/backend auth systems",
                "Adding modern authentication features",
                "Improving user experience with auth",
                "Enhancing security and compliance",
                "Simplifying authentication maintenance"
            ]
        }

    def analyze_current_auth_system(self, auth_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze existing authentication system for migration planning.

        Args:
            auth_config: Current authentication configuration

        Returns:
            Dict with comprehensive authentication analysis
        """
        self.log_activity("Analyzing current auth system", {"type": auth_config.get("type")})

        # Analysis of current authentication system
        analysis = {
            "auth_type": auth_config.get("type", "unknown"),  # jwt, session, basic, oauth
            "library_used": auth_config.get("library", "unknown"),  # flask-jwt-extended, flask-login, etc.
            "user_model_fields": auth_config.get("user_fields", []),
            "password_hashing": auth_config.get("password_hash", "unknown"),  # bcrypt, werkzeug, etc.
            "session_management": auth_config.get("sessions", False),
            "social_logins": auth_config.get("social_providers", []),
            "role_system": auth_config.get("roles", []),
            "permissions": auth_config.get("permissions", []),
            "protected_routes": auth_config.get("protected_routes", []),
            "middleware_count": len(auth_config.get("middleware", [])),
            "custom_decorators": auth_config.get("decorators", []),
            "token_storage": auth_config.get("token_storage", "unknown"),  # localStorage, cookies, etc.
            "password_reset": auth_config.get("password_reset", False),
            "email_verification": auth_config.get("email_verification", False),
            "mfa_enabled": auth_config.get("mfa", False),
            "migration_complexity": "medium"
        }

        # Recommend target authentication system
        recommendation = self._recommend_target_auth_system(analysis)

        return {
            "operation": "analyze_current_auth_system",
            "analysis_results": analysis,
            "target_recommendation": recommendation,
            "migration_challenges": self._identify_auth_migration_challenges(analysis),
            "data_migration_requirements": self._assess_user_data_migration(analysis),
            "status": "success"
        }

    def _recommend_target_auth_system(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recommend optimal target authentication system.

        Args:
            analysis: Current auth system analysis

        Returns:
            Dict with recommendation and reasoning
        """
        has_social_logins = len(analysis.get("social_providers", [])) > 0
        has_complex_roles = len(analysis.get("roles", [])) > 3
        is_enterprise = analysis.get("mfa_enabled", False) or has_complex_roles

        if is_enterprise:
            return {
                "recommended_system": "clerk",
                "reasoning": "Enterprise features, built-in MFA, advanced user management",
                "setup_complexity": "low",
                "ongoing_maintenance": "very_low",
                "cost": "paid_service"
            }
        elif has_social_logins or analysis.get("auth_type") == "oauth":
            return {
                "recommended_system": "nextauth",
                "reasoning": "Excellent social provider support, flexible configuration",
                "setup_complexity": "medium",
                "ongoing_maintenance": "low",
                "cost": "free"
            }
        elif analysis.get("password_reset", False) or analysis.get("email_verification", False):
            return {
                "recommended_system": "supabase_auth",
                "reasoning": "Built-in email workflows, database integration",
                "setup_complexity": "low",
                "ongoing_maintenance": "low",
                "cost": "freemium"
            }
        else:
            return {
                "recommended_system": "nextauth",
                "reasoning": "Most flexible for custom implementations",
                "setup_complexity": "medium",
                "ongoing_maintenance": "medium",
                "cost": "free"
            }

    def _identify_auth_migration_challenges(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Identify authentication migration challenges.

        Args:
            analysis: Auth system analysis

        Returns:
            List of challenges and solutions
        """
        challenges = []

        if analysis.get("password_hashing") not in ["bcrypt", "unknown"]:
            challenges.append({
                "challenge": "Password Hash Migration",
                "description": f"Current hashing: {analysis.get('password_hashing')}",
                "solution": "Force password reset for all users or implement hash verification bridge",
                "complexity": "high"
            })

        if len(analysis.get("roles", [])) > 0:
            challenges.append({
                "challenge": "Role and Permission Migration",
                "description": "Complex role system needs mapping to new auth provider",
                "solution": "Create role mapping and implement custom authorization logic",
                "complexity": "medium"
            })

        if analysis.get("token_storage") == "localStorage":
            challenges.append({
                "challenge": "Token Storage Security",
                "description": "localStorage is vulnerable to XSS attacks",
                "solution": "Migrate to httpOnly cookies or modern auth provider sessions",
                "complexity": "medium"
            })

        return challenges

    def _assess_user_data_migration(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assess user data migration requirements.

        Args:
            analysis: Auth system analysis

        Returns:
            Dict with migration assessment
        """
        return {
            "user_count_estimate": analysis.get("user_count", "unknown"),
            "required_fields": analysis.get("user_model_fields", []),
            "password_migration": "hash_dependent",
            "profile_data": "preservable",
            "role_data": "requires_mapping",
            "migration_approach": "gradual_with_fallback"
        }

    def implement_nextauth_migration(self, nextauth_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implement NextAuth.js migration from Flask authentication.

        Args:
            nextauth_config: NextAuth configuration parameters

        Returns:
            Dict with NextAuth implementation details
        """
        self.log_activity("Implementing NextAuth migration", {"providers": len(nextauth_config.get("providers", []))})

        providers = nextauth_config.get("providers", [])
        database_url = nextauth_config.get("database_url", "")
        custom_pages = nextauth_config.get("custom_pages", [])

        # NextAuth implementation structure
        implementation = {
            "installation": {
                "packages": ["next-auth", "@auth/prisma-adapter", "prisma"],
                "env_variables": [
                    "NEXTAUTH_URL",
                    "NEXTAUTH_SECRET",
                    "DATABASE_URL"
                ]
            },
            "configuration_files": {
                "app/api/auth/[...nextauth]/route.ts": self._generate_nextauth_config(providers),
                "middleware.ts": self._generate_auth_middleware(),
                "lib/auth.ts": "Server-side auth utilities",
                "types/next-auth.d.ts": "TypeScript type extensions"
            },
            "database_setup": {
                "adapter": "@auth/prisma-adapter",
                "required_tables": ["Account", "Session", "User", "VerificationToken"],
                "migration_script": "Prisma schema and migrations"
            },
            "provider_configuration": self._generate_provider_configs(providers),
            "session_management": {
                "strategy": "database",
                "session_max_age": "30 days",
                "update_age": "24 hours"
            }
        }

        return {
            "operation": "implement_nextauth_migration",
            "providers_count": len(providers),
            "implementation_details": implementation,
            "migration_steps": self._generate_nextauth_migration_steps(),
            "testing_checklist": self._generate_auth_testing_checklist(),
            "status": "success"
        }

    def _generate_nextauth_config(self, providers: List[str]) -> str:
        """Generate NextAuth configuration code."""
        return '''
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Implement credential validation
        return null;
      }
    })
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ token, session }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };
        '''.strip()

    def _generate_auth_middleware(self) -> str:
        """Generate authentication middleware code."""
        return '''
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Define authorization logic
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*']
};
        '''.strip()

    def _generate_provider_configs(self, providers: List[str]) -> Dict[str, Dict]:
        """Generate provider-specific configurations."""
        configs = {}

        for provider in providers:
            if provider.lower() == "google":
                configs["Google"] = {
                    "env_vars": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
                    "scopes": ["email", "profile"],
                    "setup_url": "https://console.developers.google.com/"
                }
            elif provider.lower() == "github":
                configs["GitHub"] = {
                    "env_vars": ["GITHUB_ID", "GITHUB_SECRET"],
                    "scopes": ["user:email"],
                    "setup_url": "https://github.com/settings/applications/new"
                }

        return configs

    def _generate_nextauth_migration_steps(self) -> List[Dict[str, Any]]:
        """Generate detailed migration steps for NextAuth."""
        return [
            {
                "step": 1,
                "title": "Install Dependencies",
                "description": "Install NextAuth.js and database adapter",
                "commands": ["npm install next-auth @auth/prisma-adapter prisma"],
                "estimated_time": "5 minutes"
            },
            {
                "step": 2,
                "title": "Database Schema Setup",
                "description": "Create NextAuth database tables",
                "files": ["prisma/schema.prisma"],
                "estimated_time": "15 minutes"
            },
            {
                "step": 3,
                "title": "Configure NextAuth",
                "description": "Set up authentication configuration",
                "files": ["app/api/auth/[...nextauth]/route.ts"],
                "estimated_time": "30 minutes"
            },
            {
                "step": 4,
                "title": "Implement Middleware",
                "description": "Add route protection middleware",
                "files": ["middleware.ts"],
                "estimated_time": "20 minutes"
            },
            {
                "step": 5,
                "title": "User Data Migration",
                "description": "Migrate existing users to new system",
                "estimated_time": "2-4 hours"
            },
            {
                "step": 6,
                "title": "Update Components",
                "description": "Replace auth logic in components",
                "estimated_time": "1-3 hours"
            },
            {
                "step": 7,
                "title": "Testing and Validation",
                "description": "Comprehensive testing of auth flows",
                "estimated_time": "2-4 hours"
            }
        ]

    def implement_clerk_migration(self, clerk_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implement Clerk.dev migration from Flask authentication.

        Args:
            clerk_config: Clerk configuration parameters

        Returns:
            Dict with Clerk implementation details
        """
        self.log_activity("Implementing Clerk migration", {"features": len(clerk_config.get("features", []))})

        features = clerk_config.get("features", [])
        organization_support = clerk_config.get("organizations", False)

        # Clerk implementation structure
        implementation = {
            "installation": {
                "packages": ["@clerk/nextjs"],
                "env_variables": [
                    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
                    "CLERK_SECRET_KEY",
                    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
                    "NEXT_PUBLIC_CLERK_SIGN_UP_URL"
                ]
            },
            "configuration_files": {
                "app/layout.tsx": "ClerkProvider wrapper",
                "middleware.ts": "Clerk authentication middleware",
                "lib/auth.ts": "Server-side utilities"
            },
            "features_available": {
                "user_management": "Built-in user profiles and management",
                "social_logins": "Pre-configured social providers",
                "organizations": "Multi-tenant organization support" if organization_support else "Not enabled",
                "mfa": "Built-in multi-factor authentication",
                "webhooks": "User event webhooks for data sync"
            },
            "components": [
                "SignIn",
                "SignUp",
                "UserProfile",
                "OrganizationProfile",
                "UserButton"
            ]
        }

        return {
            "operation": "implement_clerk_migration",
            "features_enabled": features,
            "organization_support": organization_support,
            "implementation_details": implementation,
            "migration_advantages": [
                "Minimal code required",
                "Built-in UI components",
                "Enterprise features included",
                "Automatic security updates",
                "Comprehensive dashboard"
            ],
            "status": "success"
        }

    def _generate_auth_testing_checklist(self) -> List[Dict[str, Any]]:
        """Generate comprehensive authentication testing checklist."""
        return [
            {
                "category": "Basic Authentication",
                "tests": [
                    "User sign up with email/password",
                    "User sign in with valid credentials",
                    "User sign in with invalid credentials",
                    "Password reset flow",
                    "Email verification (if applicable)"
                ]
            },
            {
                "category": "Social Authentication",
                "tests": [
                    "Google OAuth sign in",
                    "GitHub OAuth sign in",
                    "Account linking between providers",
                    "Social account disconnection"
                ]
            },
            {
                "category": "Route Protection",
                "tests": [
                    "Access protected routes while authenticated",
                    "Redirect to sign in when not authenticated",
                    "Proper role-based access control",
                    "API route protection"
                ]
            },
            {
                "category": "Session Management",
                "tests": [
                    "Session persistence across browser restarts",
                    "Session expiration handling",
                    "Sign out functionality",
                    "Concurrent session handling"
                ]
            },
            {
                "category": "Security",
                "tests": [
                    "CSRF protection validation",
                    "XSS vulnerability testing",
                    "Rate limiting on auth endpoints",
                    "Secure cookie configuration"
                ]
            }
        ]