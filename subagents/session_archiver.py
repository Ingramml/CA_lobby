"""
Session Archiver Agent for Claude Code
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import os
from .base_agent import BaseAgent


class SessionArchiverAgent(BaseAgent):
    """
    Specialized agent for archiving and summarizing Claude AI conversation sessions
    with learning-focused summaries.
    """

    def __init__(self):
        super().__init__(
            agent_type="session-archiver",
            description="Specialized agent for archiving and summarizing Claude AI conversation sessions with learning-focused summaries.",
            tools=["Bash", "Glob", "Grep", "Read", "Edit", "MultiEdit", "Write", "NotebookEdit", "WebFetch", "TodoWrite", "WebSearch", "BashOutput", "KillShell"]
        )
        self.archive_folder = "Session_Archives"

    def execute_task(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Execute session archiving task.

        Args:
            prompt: The archiving task description
            **kwargs: Additional parameters including session_data

        Returns:
            Dict containing archiving results
        """
        self.log_activity("Starting session archiving task", {"prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt})

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        session_data = kwargs.get("session_data", {})

        # Create archive structure
        archive_files = self._create_archive_structure(timestamp, session_data)

        result = {
            "status": "completed",
            "agent_type": self.agent_type,
            "task_type": "session_archiving",
            "prompt": prompt,
            "archive_timestamp": timestamp,
            "archive_folder": self.archive_folder,
            "files_created": archive_files,
            "session_summary": {},
            "learning_insights": [],
            "technical_decisions": [],
            "future_references": [],
            "timestamp": self.created_at.isoformat()
        }

        self.log_activity("Completed session archiving", {"files_created": len(archive_files)})
        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the agent's session archiving capabilities.

        Returns:
            Dict describing capabilities and features
        """
        return {
            "agent_type": self.agent_type,
            "description": self.description,
            "tools_available": self.tools,
            "operating_location": f"{self.archive_folder} folder within current project directory",
            "archive_structure": {
                "SESSION_ARCHIVE_[timestamp].md": "Complete conversation record",
                "SESSION_SUMMARY_[timestamp].md": "Learning-focused summary with key insights",
                "SESSION_PLAN_[timestamp].md": "Planning documentation and implementation tracking"
            },
            "best_use_cases": [
                "Archiving completed coding sessions",
                "Creating learning-focused summaries",
                "Preserving debugging sessions for future reference",
                "Converting sessions into structured learning resources",
                "Maintaining project knowledge base within repository"
            ],
            "when_to_use": [
                "At the end of productive coding sessions",
                "After complex troubleshooting or debugging sessions",
                "When you want to preserve insights for future reference",
                "To create learning resources from conversation sessions",
                "For maintaining team knowledge and decision history"
            ],
            "key_benefits": [
                "Organized Storage: Clean separation of archives from project code files",
                "Version Control Integration: Archives become part of the git repository",
                "Team Knowledge Sharing: All team members can access session insights",
                "Context Preservation: Technical decisions stay with the project",
                "Easy Discovery: All session documentation centralized",
                "Future Reference: Easy access to implementation rationale"
            ]
        }

    def _create_archive_structure(self, timestamp: str, session_data: Dict[str, Any]) -> List[str]:
        """
        Create the archive folder structure and file templates.

        Args:
            timestamp: Timestamp for the archive
            session_data: Session data to archive

        Returns:
            List of created file paths
        """
        archive_files = []

        # Create archive directory if it doesn't exist
        archive_path = os.path.join(self.working_directory, self.archive_folder)
        os.makedirs(archive_path, exist_ok=True)

        # Archive files to create
        files_to_create = [
            f"SESSION_ARCHIVE_{timestamp}.md",
            f"SESSION_SUMMARY_{timestamp}.md",
            f"SESSION_PLAN_{timestamp}.md"
        ]

        for filename in files_to_create:
            file_path = os.path.join(archive_path, filename)
            archive_files.append(file_path)

        return archive_files

    def create_session_archive(self, session_data: Dict[str, Any], timestamp: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a complete session archive.

        Args:
            session_data: The session data to archive
            timestamp: Optional custom timestamp

        Returns:
            Dict with archive creation results
        """
        if not timestamp:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        self.log_activity("Creating session archive", {"timestamp": timestamp})

        # Archive content structure
        archive_content = {
            "metadata": {
                "session_id": session_data.get("session_id", "unknown"),
                "start_time": session_data.get("start_time", ""),
                "end_time": session_data.get("end_time", ""),
                "duration": session_data.get("duration", ""),
                "participant_count": session_data.get("participant_count", 1)
            },
            "conversation_history": session_data.get("messages", []),
            "code_changes": session_data.get("code_changes", []),
            "files_modified": session_data.get("files_modified", []),
            "tools_used": session_data.get("tools_used", []),
            "errors_encountered": session_data.get("errors", []),
            "solutions_found": session_data.get("solutions", [])
        }

        return {
            "operation": "create_session_archive",
            "timestamp": timestamp,
            "archive_content": archive_content,
            "file_path": f"{self.archive_folder}/SESSION_ARCHIVE_{timestamp}.md",
            "status": "success"
        }

    def create_learning_summary(self, session_data: Dict[str, Any], timestamp: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a learning-focused summary of the session.

        Args:
            session_data: The session data to summarize
            timestamp: Optional custom timestamp

        Returns:
            Dict with summary creation results
        """
        if not timestamp:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        self.log_activity("Creating learning summary", {"timestamp": timestamp})

        # Extract learning insights
        learning_insights = {
            "key_concepts_learned": [],
            "technical_skills_developed": [],
            "problem_solving_approaches": [],
            "best_practices_identified": [],
            "common_pitfalls_avoided": [],
            "tools_and_techniques": [],
            "future_application": []
        }

        # Analyze session for learning content
        messages = session_data.get("messages", [])
        code_changes = session_data.get("code_changes", [])
        solutions = session_data.get("solutions", [])

        # Extract insights from the session (simplified logic)
        if code_changes:
            learning_insights["technical_skills_developed"].append("Code modification and refactoring")

        if solutions:
            learning_insights["problem_solving_approaches"].extend([
                sol.get("approach", "") for sol in solutions
            ])

        return {
            "operation": "create_learning_summary",
            "timestamp": timestamp,
            "learning_insights": learning_insights,
            "file_path": f"{self.archive_folder}/SESSION_SUMMARY_{timestamp}.md",
            "status": "success"
        }

    def create_implementation_plan(self, session_data: Dict[str, Any], timestamp: Optional[str] = None) -> Dict[str, Any]:
        """
        Create planning documentation and implementation tracking.

        Args:
            session_data: The session data to document
            timestamp: Optional custom timestamp

        Returns:
            Dict with plan creation results
        """
        if not timestamp:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        self.log_activity("Creating implementation plan", {"timestamp": timestamp})

        # Implementation tracking structure
        implementation_plan = {
            "objectives": session_data.get("objectives", []),
            "completed_tasks": session_data.get("completed_tasks", []),
            "pending_tasks": session_data.get("pending_tasks", []),
            "technical_decisions": session_data.get("technical_decisions", []),
            "architecture_changes": session_data.get("architecture_changes", []),
            "dependencies_added": session_data.get("dependencies", []),
            "testing_requirements": session_data.get("testing_requirements", []),
            "deployment_considerations": session_data.get("deployment_notes", []),
            "follow_up_actions": session_data.get("follow_up_actions", [])
        }

        return {
            "operation": "create_implementation_plan",
            "timestamp": timestamp,
            "implementation_plan": implementation_plan,
            "file_path": f"{self.archive_folder}/SESSION_PLAN_{timestamp}.md",
            "status": "success"
        }

    def organize_archives(self) -> Dict[str, Any]:
        """
        Organize and index existing archives for easy discovery.

        Returns:
            Dict with organization results
        """
        self.log_activity("Organizing archives", {})

        # Scan archive directory for existing files
        archive_path = os.path.join(self.working_directory, self.archive_folder)

        if not os.path.exists(archive_path):
            return {
                "operation": "organize_archives",
                "status": "info",
                "message": f"Archive directory {self.archive_folder} does not exist yet"
            }

        # Categorize archive files
        organization = {
            "total_archives": 0,
            "session_archives": [],
            "session_summaries": [],
            "session_plans": [],
            "date_range": {"earliest": None, "latest": None}
        }

        try:
            for filename in os.listdir(archive_path):
                if filename.startswith("SESSION_ARCHIVE_"):
                    organization["session_archives"].append(filename)
                elif filename.startswith("SESSION_SUMMARY_"):
                    organization["session_summaries"].append(filename)
                elif filename.startswith("SESSION_PLAN_"):
                    organization["session_plans"].append(filename)

            organization["total_archives"] = len(organization["session_archives"])

        except Exception as e:
            return {
                "operation": "organize_archives",
                "status": "error",
                "message": f"Error organizing archives: {str(e)}"
            }

        return {
            "operation": "organize_archives",
            "organization": organization,
            "status": "success"
        }