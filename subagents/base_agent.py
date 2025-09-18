"""
Base Agent Class for Claude Code Subagents
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
import os


class BaseAgent(ABC):
    """
    Abstract base class for all Claude Code subagents.
    Provides common functionality and interface for specialized agents.
    """

    def __init__(self, agent_type: str, description: str, tools: List[str]):
        self.agent_type = agent_type
        self.description = description
        self.tools = tools
        self.created_at = datetime.now()
        self.working_directory = os.getcwd()

    @abstractmethod
    def execute_task(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Execute a task with the given prompt.

        Args:
            prompt: The task description to execute
            **kwargs: Additional parameters for the task

        Returns:
            Dict containing task results and metadata
        """
        pass

    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return a dictionary describing the agent's capabilities.

        Returns:
            Dict with capabilities, tools, and use cases
        """
        pass

    def get_info(self) -> Dict[str, Any]:
        """
        Get basic information about the agent.

        Returns:
            Dict with agent metadata
        """
        return {
            'agent_type': self.agent_type,
            'description': self.description,
            'tools': self.tools,
            'created_at': self.created_at.isoformat(),
            'working_directory': self.working_directory
        }

    def validate_tools(self, required_tools: List[str]) -> bool:
        """
        Validate that the agent has access to required tools.

        Args:
            required_tools: List of required tool names

        Returns:
            True if all required tools are available
        """
        return all(tool in self.tools or self.tools == ['*'] for tool in required_tools)

    def log_activity(self, activity: str, details: Optional[Dict] = None):
        """
        Log agent activity for debugging and monitoring.

        Args:
            activity: Description of the activity
            details: Additional details about the activity
        """
        timestamp = datetime.now().isoformat()
        log_entry = {
            'timestamp': timestamp,
            'agent_type': self.agent_type,
            'activity': activity,
            'details': details or {}
        }

        # In a real implementation, this would log to a proper logging system
        print(f"[{timestamp}] {self.agent_type}: {activity}")
        if details:
            print(f"  Details: {details}")