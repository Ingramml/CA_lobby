"""
Agent Registry for Claude Code Subagents
"""

from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent
from .general_purpose import GeneralPurposeAgent
from .statusline_setup import StatuslineSetupAgent
from .output_style_setup import OutputStyleSetupAgent
from .website_coding_specialist import WebsiteCodingSpecialist
from .session_archiver import SessionArchiverAgent
from .vercel_deployment_expert import VercelDeploymentExpert
from .ui_database_designer import UIDatabaseDesigner
from .nextjs_fullstack_expert import NextJSFullstackExpert
from .react_nextjs_migration_specialist import ReactNextJSMigrationSpecialist
from .flask_nextjs_api_migration import FlaskNextJSAPIMigrationSpecialist
from .authentication_migration_specialist import AuthenticationMigrationSpecialist


class AgentRegistry:
    """
    Central registry for all Claude Code subagents with discovery and management capabilities.
    """

    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._initialize_agents()

    def _initialize_agents(self):
        """Initialize all available agents."""
        agents = [
            GeneralPurposeAgent(),
            StatuslineSetupAgent(),
            OutputStyleSetupAgent(),
            WebsiteCodingSpecialist(),
            SessionArchiverAgent(),
            VercelDeploymentExpert(),
            UIDatabaseDesigner(),
            NextJSFullstackExpert(),
            ReactNextJSMigrationSpecialist(),
            FlaskNextJSAPIMigrationSpecialist(),
            AuthenticationMigrationSpecialist()
        ]

        for agent in agents:
            self._agents[agent.agent_type] = agent

    def get_agent(self, agent_type: str) -> Optional[BaseAgent]:
        """
        Get agent by type.

        Args:
            agent_type: The agent type identifier

        Returns:
            Agent instance or None if not found
        """
        return self._agents.get(agent_type)

    def list_agents(self) -> List[str]:
        """
        List all available agent types.

        Returns:
            List of agent type identifiers
        """
        return list(self._agents.keys())

    def get_agents_by_capability(self, capability: str) -> List[BaseAgent]:
        """
        Find agents that have a specific capability.

        Args:
            capability: Capability to search for

        Returns:
            List of agents with the capability
        """
        matching_agents = []

        for agent in self._agents.values():
            agent_capabilities = agent.get_capabilities()

            # Search in specializations, best_use_cases, etc.
            searchable_fields = [
                agent_capabilities.get('specializations', []),
                agent_capabilities.get('best_use_cases', []),
                agent_capabilities.get('when_to_use', []),
                [agent_capabilities.get('description', '')]
            ]

            for field in searchable_fields:
                if any(capability.lower() in str(item).lower() for item in field):
                    matching_agents.append(agent)
                    break

        return matching_agents

    def recommend_agent_for_task(self, task_description: str) -> List[Dict[str, Any]]:
        """
        Recommend best agents for a given task.

        Args:
            task_description: Description of the task to perform

        Returns:
            List of recommended agents with match scores
        """
        recommendations = []
        task_lower = task_description.lower()

        # Keywords for different agent types
        agent_keywords = {
            'vercel-deployment-expert': ['vercel', 'deploy', 'deployment', 'hosting', 'edge', 'serverless'],
            'nextjs-fullstack-expert': ['nextjs', 'next.js', 'react', 'fullstack', 'app router'],
            'react-nextjs-migration-specialist': ['migrate', 'migration', 'cra', 'create-react-app'],
            'flask-nextjs-api-migration': ['flask', 'python', 'api migration', 'backend'],
            'authentication-migration-specialist': ['auth', 'authentication', 'jwt', 'login', 'session'],
            'website-coding-specialist': ['ui', 'interface', 'dashboard', 'frontend', 'components'],
            'ui-database-designer': ['database', 'data visualization', 'tables', 'forms'],
            'session-archiver': ['archive', 'documentation', 'session', 'learning'],
            'general-purpose': ['research', 'analysis', 'search', 'complex']
        }

        for agent_type, keywords in agent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in task_lower)

            if score > 0:
                agent = self._agents.get(agent_type)
                if agent:
                    recommendations.append({
                        'agent': agent,
                        'agent_type': agent_type,
                        'score': score,
                        'match_keywords': [kw for kw in keywords if kw in task_lower]
                    })

        # Sort by score (highest first)
        recommendations.sort(key=lambda x: x['score'], reverse=True)

        return recommendations

    def execute_task_with_best_agent(self, task_description: str, **kwargs) -> Dict[str, Any]:
        """
        Execute task with the most suitable agent.

        Args:
            task_description: Task to execute
            **kwargs: Additional parameters

        Returns:
            Task execution results
        """
        recommendations = self.recommend_agent_for_task(task_description)

        if not recommendations:
            # Fallback to general-purpose agent
            agent = self._agents.get('general-purpose')
        else:
            agent = recommendations[0]['agent']

        if agent:
            return agent.execute_task(task_description, **kwargs)
        else:
            return {
                'status': 'error',
                'message': 'No suitable agent found for task',
                'task': task_description
            }

    def get_agent_info(self, agent_type: str) -> Dict[str, Any]:
        """
        Get detailed information about an agent.

        Args:
            agent_type: Agent type identifier

        Returns:
            Agent information or error
        """
        agent = self._agents.get(agent_type)

        if not agent:
            return {
                'error': 'Agent not found',
                'available_agents': self.list_agents()
            }

        return {
            'basic_info': agent.get_info(),
            'capabilities': agent.get_capabilities()
        }

    def get_migration_workflow_agents(self) -> List[Dict[str, Any]]:
        """
        Get agents specifically for CA Lobby migration workflow.

        Returns:
            List of migration-relevant agents with their roles
        """
        migration_agents = [
            {
                'agent_type': 'nextjs-fullstack-expert',
                'role': 'Next.js 14 architecture and implementation',
                'phase': 'Foundation & Development'
            },
            {
                'agent_type': 'vercel-deployment-expert',
                'role': 'Deployment optimization and Vercel configuration',
                'phase': 'Deployment & Performance'
            },
            {
                'agent_type': 'flask-nextjs-api-migration',
                'role': 'Python to TypeScript API conversion',
                'phase': 'API Migration'
            },
            {
                'agent_type': 'authentication-migration-specialist',
                'role': 'Authentication system implementation',
                'phase': 'Security & Auth'
            },
            {
                'agent_type': 'website-coding-specialist',
                'role': 'Dashboard and UI component creation',
                'phase': 'Frontend Development'
            },
            {
                'agent_type': 'ui-database-designer',
                'role': 'BigQuery data visualization interfaces',
                'phase': 'Data Interface Design'
            },
            {
                'agent_type': 'session-archiver',
                'role': 'Migration progress documentation',
                'phase': 'Documentation & Learning'
            }
        ]

        return migration_agents

    def execute_parallel_tasks(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Execute multiple tasks in parallel using different agents.

        Args:
            tasks: List of tasks with agent_type and task_description

        Returns:
            List of task results
        """
        results = []

        for task in tasks:
            agent_type = task.get('agent_type')
            task_description = task.get('task_description', '')
            task_params = task.get('params', {})

            agent = self._agents.get(agent_type)
            if agent:
                result = agent.execute_task(task_description, **task_params)
                result['original_task'] = task
                results.append(result)
            else:
                results.append({
                    'status': 'error',
                    'message': f'Agent {agent_type} not found',
                    'original_task': task
                })

        return results

    def get_registry_stats(self) -> Dict[str, Any]:
        """
        Get registry statistics and health information.

        Returns:
            Registry statistics
        """
        return {
            'total_agents': len(self._agents),
            'agent_types': list(self._agents.keys()),
            'specialization_coverage': {
                'deployment': ['vercel-deployment-expert'],
                'frontend': ['nextjs-fullstack-expert', 'website-coding-specialist', 'ui-database-designer'],
                'migration': ['react-nextjs-migration-specialist', 'flask-nextjs-api-migration', 'authentication-migration-specialist'],
                'general': ['general-purpose', 'session-archiver'],
                'configuration': ['statusline-setup', 'output-style-setup']
            },
            'registry_health': 'healthy'
        }


# Global registry instance
registry = AgentRegistry()

def get_registry() -> AgentRegistry:
    """Get the global agent registry instance."""
    return registry