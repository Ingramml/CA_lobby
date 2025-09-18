"""
Output Style Setup Agent for Claude Code
"""

from typing import Dict, Any, List
from .base_agent import BaseAgent


class OutputStyleSetupAgent(BaseAgent):
    """
    Agent dedicated to creating and configuring Claude Code output styles.
    """

    def __init__(self):
        super().__init__(
            agent_type="output-style-setup",
            description="Agent dedicated to creating and configuring Claude Code output styles.",
            tools=["Read", "Write", "Edit", "Glob", "Grep"]
        )

    def execute_task(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Execute output style configuration task.

        Args:
            prompt: The style configuration task description
            **kwargs: Additional parameters for styling

        Returns:
            Dict containing style configuration results
        """
        self.log_activity("Starting output style setup task", {"prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt})

        # In a real implementation, this would contain the actual styling logic
        # using Read, Write, Edit, Glob, Grep tools to configure output styles

        result = {
            "status": "completed",
            "agent_type": self.agent_type,
            "task_type": "output_style_configuration",
            "prompt": prompt,
            "styles_created": [],
            "configurations_applied": {},
            "files_modified": [],
            "themes_available": [],
            "validation_results": {},
            "timestamp": self.created_at.isoformat()
        }

        self.log_activity("Completed output style setup", {"styles_count": len(result["styles_created"])})
        return result

    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the agent's output style configuration capabilities.

        Returns:
            Dict describing capabilities and use cases
        """
        return {
            "agent_type": self.agent_type,
            "description": self.description,
            "tools_available": ["Read", "Write", "Edit", "Glob", "Grep"],
            "specializations": [
                "Custom output formatting styles",
                "Display preferences for code output",
                "Project-specific output configurations"
            ],
            "best_use_cases": [
                "Creating custom output formatting styles",
                "Configuring display preferences for code output",
                "Setting up project-specific output configurations"
            ],
            "when_to_use": [
                "When customizing how Claude Code displays output",
                "For setting up consistent output formatting across projects"
            ],
            "supported_formats": [
                "syntax_highlighting",
                "color_schemes",
                "font_preferences",
                "indentation_styles",
                "line_numbering",
                "error_formatting",
                "success_formatting"
            ]
        }

    def create_custom_style(self, style_name: str, style_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new custom output style.

        Args:
            style_name: Name for the new style
            style_config: Style configuration dictionary

        Returns:
            Dict with style creation results
        """
        self.log_activity("Creating custom style", {"name": style_name, "config_keys": list(style_config.keys())})

        # Validate style configuration
        required_fields = ["colors", "formatting", "layout"]
        missing_fields = [field for field in required_fields if field not in style_config]

        if missing_fields:
            return {
                "operation": "create_custom_style",
                "status": "error",
                "message": f"Missing required fields: {missing_fields}",
                "style_name": style_name
            }

        # Implementation would create the actual style files
        return {
            "operation": "create_custom_style",
            "style_name": style_name,
            "config_applied": style_config,
            "file_created": f"{style_name}.style",
            "status": "success"
        }

    def configure_syntax_highlighting(self, language: str, highlight_config: Dict[str, str]) -> Dict[str, Any]:
        """
        Configure syntax highlighting for a specific language.

        Args:
            language: Programming language name
            highlight_config: Highlighting configuration dictionary

        Returns:
            Dict with highlighting configuration results
        """
        self.log_activity("Configuring syntax highlighting", {"language": language, "rules_count": len(highlight_config)})

        supported_languages = ["python", "javascript", "typescript", "html", "css", "json", "yaml", "markdown"]

        if language.lower() not in supported_languages:
            return {
                "operation": "configure_syntax_highlighting",
                "status": "warning",
                "message": f"Language '{language}' not in supported list, but will attempt configuration",
                "supported_languages": supported_languages
            }

        return {
            "operation": "configure_syntax_highlighting",
            "language": language,
            "highlighting_rules": highlight_config,
            "status": "success"
        }

    def setup_color_scheme(self, scheme_name: str, color_palette: Dict[str, str]) -> Dict[str, Any]:
        """
        Set up a color scheme for output display.

        Args:
            scheme_name: Name of the color scheme
            color_palette: Dictionary mapping element types to colors

        Returns:
            Dict with color scheme setup results
        """
        self.log_activity("Setting up color scheme", {"scheme": scheme_name, "colors_count": len(color_palette)})

        # Validate color format (hex codes)
        invalid_colors = []
        for element, color in color_palette.items():
            if not (color.startswith('#') and len(color) == 7):
                invalid_colors.append(f"{element}: {color}")

        if invalid_colors:
            return {
                "operation": "setup_color_scheme",
                "status": "error",
                "message": f"Invalid color formats: {invalid_colors}",
                "note": "Colors must be hex codes (e.g., #FF0000)"
            }

        return {
            "operation": "setup_color_scheme",
            "scheme_name": scheme_name,
            "color_palette": color_palette,
            "status": "success",
            "preview_available": True
        }

    def configure_formatting_options(self, format_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Configure general formatting options for output.

        Args:
            format_config: Dictionary of formatting preferences

        Returns:
            Dict with formatting configuration results
        """
        self.log_activity("Configuring formatting options", {"options_count": len(format_config)})

        # Available formatting options
        available_options = {
            "line_numbers": bool,
            "word_wrap": bool,
            "indentation_size": int,
            "indentation_type": str,  # "spaces" or "tabs"
            "max_line_length": int,
            "show_whitespace": bool,
            "highlight_current_line": bool
        }

        # Validate configuration
        validation_errors = []
        for option, value in format_config.items():
            if option not in available_options:
                validation_errors.append(f"Unknown option: {option}")
            elif not isinstance(value, available_options[option]):
                expected_type = available_options[option].__name__
                validation_errors.append(f"Option '{option}' expects {expected_type}, got {type(value).__name__}")

        if validation_errors:
            return {
                "operation": "configure_formatting_options",
                "status": "error",
                "errors": validation_errors,
                "available_options": available_options
            }

        return {
            "operation": "configure_formatting_options",
            "config_applied": format_config,
            "status": "success"
        }

    def create_project_style_template(self, project_type: str) -> Dict[str, Any]:
        """
        Create a style template optimized for a specific project type.

        Args:
            project_type: Type of project (web, mobile, data_science, etc.)

        Returns:
            Dict with template creation results
        """
        self.log_activity("Creating project style template", {"project_type": project_type})

        # Pre-defined templates for different project types
        templates = {
            "web": {
                "colors": {"html": "#e34c26", "css": "#1572b6", "javascript": "#f7df1e"},
                "formatting": {"indentation_size": 2, "indentation_type": "spaces"},
                "highlights": ["errors", "warnings", "deprecated"]
            },
            "python": {
                "colors": {"keywords": "#0000ff", "strings": "#008000", "comments": "#808080"},
                "formatting": {"indentation_size": 4, "indentation_type": "spaces"},
                "highlights": ["pep8_violations", "type_hints", "docstrings"]
            },
            "data_science": {
                "colors": {"dataframes": "#ff6b35", "plots": "#004e89", "stats": "#009ffd"},
                "formatting": {"line_numbers": True, "word_wrap": True},
                "highlights": ["data_warnings", "performance_tips", "best_practices"]
            }
        }

        if project_type not in templates:
            return {
                "operation": "create_project_style_template",
                "status": "error",
                "message": f"No template available for project type: {project_type}",
                "available_templates": list(templates.keys())
            }

        template = templates[project_type]
        return {
            "operation": "create_project_style_template",
            "project_type": project_type,
            "template": template,
            "status": "success"
        }