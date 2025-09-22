# Opening Workflow Guide

**Purpose**: Standardized workflow for project initialization with Claude_files integration
**Usage**: New project setup and configuration automation
**Date Created**: 2024-09-21

---

## Overview

This guide provides multiple execution options for implementing a consistent opening workflow that:
1. **Copies ~/.claude/master-files/** to current project directory (NEW CENTRALIZED SOURCE)
2. **Executes project-setup-script.sh** for project-specific initialization
3. **Creates all subject outlines** in @Claude_files/sub-agents-guide.md

This workflow ensures consistent project initialization and maintains synchronized documentation across all Claude-assisted projects.

---

## Execution Options

### Option 1: Manual Three-Step Process
**Description**: Execute each step manually with separate commands

**Steps:**
1. Copy centralized files: "Copy ~/.claude/master-files to current project directory"
2. Execute setup script: "Run project-setup-script.sh from Claude_files"
3. Create subject outlines: "Generate all specialist agent outlines in Claude_files/sub-agents-guide.md"

**Pros:**
- Full control over each step
- Customizable per project
- No setup required
- Easy troubleshooting

**Cons:**
- Requires remembering all three steps
- Potential for inconsistency
- Manual effort each time
- Risk of skipping steps

**Best For**: One-off projects, custom initialization needs

---

### Option 2: Shell Script Automation
**Description**: Partially automated with bash script

**Implementation:**
```bash
#!/bin/bash
# opening-workflow.sh
echo "Running opening workflow..."

echo "1. Copying ~/Github/Claude_files to current project"
if [ -d "~/Github/Claude_files" ]; then
    cp -r ~/Github/Claude_files ./Claude_files
    echo "✅ Claude_files copied successfully"
else
    echo "❌ ~/Github/Claude_files not found"
    exit 1
fi

echo "2. Executing project setup script"
if [ -f "./Claude_files/project-setup-script.sh" ]; then
    chmod +x ./Claude_files/project-setup-script.sh
    ./Claude_files/project-setup-script.sh
    echo "✅ Project setup script executed"
else
    echo "⚠️ project-setup-script.sh not found, skipping"
fi

echo "3. Subject outline generation (manual step required)"
echo "Please run: 'Generate all specialist agent outlines in Claude_files/sub-agents-guide.md'"
echo "Opening workflow complete!"
```

**Usage:** `bash opening-workflow.sh`

**Pros:**
- Partially automated file operations
- Reusable across projects
- Error checking included
- Simple implementation

**Cons:**
- Still requires manual outline generation
- Requires script maintenance
- Limited customization

**Best For**: Projects with consistent structure requirements

---

### Option 3: Standardized Prompt Pattern ⭐ **RECOMMENDED**
**Description**: Single, memorable command for consistent execution

**Standard Command:**
```
"Run opening workflow: copy ~/.claude/master-files to project + execute project-setup-script.sh + create all subject outlines in Claude_files/sub-agents-guide.md"
```

**Shorter Alternative:**
```
"open"
```

**Implementation:**
1. Use the exact prompt above
2. Claude will execute all three workflow steps
3. Consistent results across all new projects

**Pros:**
- Single command approach
- Easy to remember and execute
- Consistent across all projects
- No additional scripts or dependencies
- Immediate availability
- Comprehensive automation

**Cons:**
- Still requires manual execution
- Relies on memory for consistency

**Best For:** Regular use, consistent workflow, immediate implementation

**Usage Example:**
```
User: "open"
Claude:
1. Copies ~/.claude/master-files to ./Claude_files
2. Executes ./Claude_files/project-setup-script.sh
3. Generates all specialist agent outlines in Claude_files/sub-agents-guide.md
4. Reports completion status
```

---

### Option 4: Enhanced Sub-Agent Workflow ⭐ **ADVANCED**
**Description**: Dedicated sub-agent for comprehensive workflow automation

**Sub-Agent:** `opening-workflow-manager`

**Capabilities:**
- Coordinates file copying, script execution, and outline generation
- Provides status reporting and error handling
- Comprehensive workflow execution with validation
- Reusable across projects
- Intelligent error recovery

**Usage:**
```typescript
Task({
  subagent_type: "opening-workflow-manager", // Note: Use general-purpose until custom agents available
  description: "Execute opening workflow",
  prompt: "Run complete opening workflow: copy ~/Github/Claude_files + execute project-setup-script.sh + create all subject outlines"
})
```

**Features:**
- Automated file synchronization from centralized location
- Intelligent script execution with permission handling
- Comprehensive subject outline generation
- Status reporting and validation
- Error handling and recovery options

**Pros:**
- Fully integrated workflow
- Advanced error handling and status reporting
- Consistent execution with validation
- Comprehensive automation
- Reusable across all projects

**Cons:**
- Requires custom sub-agent implementation
- More complex setup
- Dependency on sub-agent system

**Best For:** Advanced users, frequent usage, complex projects

---

### Option 5: Project Template Integration
**Description**: Include workflow in project creation templates

**Implementation:**
- Add `opening-workflow.sh` to all project templates
- Include opening workflow instructions in template README
- Standardize across all new Claude-assisted projects
- Template-based consistency with version control

**Usage:** Integrated into project creation process

**Pros:**
- Consistent across all new projects
- Documented process in templates
- Scalable approach
- Version controlled workflow

**Cons:**
- Requires template setup and maintenance
- Only applies to new projects
- Template maintenance overhead

**Best For:** Standardized project creation, team environments

---

### Option 6: IDE Integration
**Description**: Integrate workflow with development environment

**Implementation:**
- VS Code tasks integration
- Custom command palette entries
- Keyboard shortcuts for workflow execution
- Integration with existing development workflow

**Usage:** IDE command or keyboard shortcut

**Pros:**
- Seamless integration with development environment
- Fast execution via shortcuts
- Integrated with existing tools

**Cons:**
- IDE-specific implementation
- Requires configuration per environment
- Limited to supported IDEs

**Best For:** IDE-centric workflows, power users

---

## Recommended Implementation Strategy

### Phase 1: Immediate Implementation (Option 3)
**Start with standardized prompt pattern:**
```
"open"
```
or
```
"Run opening workflow: copy ~/Github/Claude_files to project + execute project-setup-script.sh + create all subject outlines in Claude_files/sub-agents-guide.md"
```

**Benefits:**
- Immediate availability
- No setup required
- Consistent execution
- Easy to remember

### Phase 2: Enhanced Automation (Option 4)
**Upgrade to sub-agent workflow:**
- Implement `opening-workflow-manager` sub-agent
- Add advanced error handling and status reporting
- Integrate with project templates

### Phase 3: Full Integration (Options 5-6)
**Consider for larger implementations:**
- Project template integration
- IDE automation
- Team standardization

---

## Workflow Components

### File Synchronization Requirements
- **Source**: `~/.claude/master-files/` centralized directory (NEW MASTER SOURCE)
- **Destination**: `./Claude_files/` in current project
- **Operation**: Complete copy with directory structure preservation
- **Verification**: Confirm successful copy operation and file integrity

### Script Execution Requirements
- **Target**: `./Claude_files/project-setup-script.sh`
- **Permissions**: Auto-grant execute permissions if needed
- **Error Handling**: Graceful handling of missing or failed scripts
- **Logging**: Capture script output for validation

### Subject Outline Generation
- **Target File**: `./Claude_files/sub-agents-guide.md`
- **Content**: All specialist agent definitions and outlines
- **Structure**: Organized by categories (Web Development, DevOps, etc.)
- **Integration**: Compatible with existing sub-agents guide format

---

## Usage Examples

### Option 3 Usage (Recommended)
```
User: "open"

Claude Response:
1. ✅ Copied ~/Github/Claude_files to ./Claude_files (15 files)
2. ✅ Executed project-setup-script.sh successfully
3. ✅ Generated all subject outlines in Claude_files/sub-agents-guide.md
4. 🎉 Opening workflow complete - project ready for development
```

### Option 4 Usage (Advanced)
```typescript
// Using general-purpose agent (until custom agents available)
Task({
  subagent_type: "general-purpose",
  description: "Execute opening workflow",
  prompt: "Act as opening-workflow-manager and execute complete opening workflow: copy ~/Github/Claude_files + execute project-setup-script.sh + create all subject outlines with status reporting"
})
```

---

## Best Practices

### Consistency
- Use the exact same prompt/command each time
- Maintain standardized directory structures
- Document any variations or customizations
- Keep centralized Claude_files up to date

### Preparation
- Ensure ~/Github/Claude_files is current and complete
- Verify project-setup-script.sh is executable and functional
- Check target project directory permissions
- Backup existing Claude_files if present

### Validation
- Verify file copy completeness and integrity
- Confirm script execution success
- Check subject outline generation quality
- Validate project structure after workflow

### Maintenance
- Regularly update centralized ~/Github/Claude_files
- Review and improve project-setup-script.sh
- Update workflow documentation as needed
- Sync improvements across all projects

---

## Troubleshooting

### Common Issues
1. **File copy failures**: Check source directory existence and permissions
2. **Script execution errors**: Verify script permissions and dependencies
3. **Missing ~/Github/Claude_files**: Initialize centralized directory
4. **Outline generation incomplete**: Ensure sub-agents-guide.md template exists

### Error Handling
- Workflow reports success/failure status for each step
- Manual fallback options available for each component
- Detailed error messages for troubleshooting
- Recovery procedures for partial failures

### Recovery Procedures
```bash
# Manual file copy if automated fails
cp -r ~/Github/Claude_files ./Claude_files

# Manual script execution
chmod +x ./Claude_files/project-setup-script.sh
./Claude_files/project-setup-script.sh

# Manual outline generation request
"Generate all specialist agent outlines in Claude_files/sub-agents-guide.md"
```

---

## Integration with Sub-Agents

### Current Compatibility
- Works with `general-purpose` agent (currently available)
- Compatible with existing sub-agents guide format
- Follows established sub-agent patterns

### Future Enhancements
- Dedicated `opening-workflow-manager` implementation
- Advanced error handling and recovery
- Cross-project synchronization tracking
- Integration with closing workflow for complete project lifecycle

---

## Workflow Customization

### Project-Specific Adaptations
- Custom project-setup-script.sh for different project types
- Specialized subject outlines for domain-specific projects
- Environment-specific configuration handling

### Team Collaboration
- Shared centralized Claude_files repository
- Standardized project-setup scripts
- Collaborative maintenance of specialist agent definitions

---

**Tags**: #workflow #project-initialization #automation #setup #sub-agents #best-practices

**Maintenance**: Update this guide when workflow improvements are identified or implemented.