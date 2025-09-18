"""
Claude Code Subagents Package

This package contains all specialized subagents available in Claude Code,
designed to help with specific types of development tasks.
"""

from .base_agent import BaseAgent
from .general_purpose import GeneralPurposeAgent
from .statusline_setup import StatuslineSetupAgent
from .output_style_setup import OutputStyleSetupAgent
from .website_coding_specialist import WebsiteCodingSpecialist
from .session_archiver import SessionArchiverAgent
from .vercel_deployment_expert import VercelDeploymentExpert
from .ui_database_designer import UIDatabaseDesigner
from .agent_registry import AgentRegistry

__all__ = [
    'BaseAgent',
    'GeneralPurposeAgent',
    'StatuslineSetupAgent',
    'OutputStyleSetupAgent',
    'WebsiteCodingSpecialist',
    'SessionArchiverAgent',
    'VercelDeploymentExpert',
    'UIDatabaseDesigner',
    'AgentRegistry'
]