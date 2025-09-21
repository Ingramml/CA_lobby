# Sync Workflows Guide

**Purpose**: Bidirectional synchronization between project Claude_files and master-files
**Usage**: Maintain consistency and preserve improvements across projects
**Date Created**: 2024-09-21

---

## Overview

This guide provides comprehensive sync workflows for managing the bidirectional synchronization between:
- **Project Source**: `./Claude_files/` (current project)
- **Master Source**: `~/.claude/master-files/` (centralized repository)

The sync system ensures that improvements made in any project are preserved and available to all future projects.

---

## Sync Commands

### 1. Sync to Master
**Command**: `"sync to master"`
**Purpose**: Copy project Claude_files changes back to ~/.claude/master-files/
**Use Case**: Preserve project improvements for future use

**Process:**
1. Compare project Claude_files with master-files
2. Identify changed/new files in project
3. Copy project changes to master-files
4. Report sync status and conflicts

### 2. Sync from Master
**Command**: `"sync from master"`
**Purpose**: Update project Claude_files from ~/.claude/master-files/
**Use Case**: Get latest improvements from master source

**Process:**
1. Compare master-files with project Claude_files
2. Identify changed/new files in master
3. Copy master changes to project
4. Report sync status and updates

### 3. Bidirectional Sync
**Command**: `"sync bidirectional"`
**Purpose**: Intelligent merge of changes from both directions
**Use Case**: Synchronize when both locations have changes

**Process:**
1. Compare both directions for changes
2. Identify conflicts and safe merges
3. Auto-merge non-conflicting changes
4. Prompt user for conflict resolution
5. Execute final synchronization

### 4. Sync Status
**Command**: `"sync status"`
**Purpose**: Show what files differ between locations
**Use Case**: Check synchronization state before syncing

**Output:**
- Files modified in project only
- Files modified in master only
- Files modified in both (conflicts)
- Files that are synchronized

### 5. Enhanced Closing Workflow
**Command**: `"close"` (now includes sync)
**Purpose**: Session archival + automatic sync to master
**Use Case**: Standard session closure with preservation

**Process:**
1. Create session archive (existing functionality)
2. Sync project changes to master (NEW)
3. Report sync status and any conflicts
4. Complete closing workflow

---

## Sync Workflow Implementation

### Automatic Detection System

#### File Change Detection
```bash
# Check for newer files in project
find ./Claude_files -newer ~/.claude/master-files/sync-timestamp.txt

# Check for newer files in master
find ~/.claude/master-files -newer ./Claude_files/sync-timestamp.txt
```

#### Conflict Resolution Strategy
1. **Safe Files**: Copy without prompting
   - New files in either location
   - Files changed in only one location
   - Non-conflicting content changes

2. **Conflict Files**: Require user input
   - Same file modified in both locations
   - Different content that can't auto-merge
   - Files with incompatible changes

3. **Special Handling**:
   - Project-specific customizations preserved
   - Master templates updated intelligently
   - Agent outlines regenerated as needed

### Sync Operation Flow

#### Pre-Sync Validation
1. **Check Source Accessibility**
   - Verify ~/.claude/master-files/ exists and readable
   - Confirm ./Claude_files/ exists and writable
   - Validate file permissions for sync operations

2. **Backup Creation**
   - Create backup of master-files before major changes
   - Preserve project-specific configurations
   - Maintain rollback capabilities

#### Sync Execution
1. **Analysis Phase**
   - Scan both directories for changes
   - Create change manifest with timestamps
   - Identify conflicts and safe operations

2. **Conflict Resolution Phase**
   - Present conflicts to user with options
   - Provide merge suggestions and previews
   - Allow manual resolution or automatic handling

3. **Execution Phase**
   - Execute safe operations automatically
   - Apply user-resolved conflicts
   - Update sync timestamps and metadata

4. **Validation Phase**
   - Verify all operations completed successfully
   - Check file integrity and permissions
   - Generate sync completion report

---

## Conflict Resolution

### Conflict Types

#### 1. Content Conflicts
**Scenario**: Same file modified in both locations with different content
**Resolution Options**:
- Keep project version
- Keep master version
- Manual merge with diff view
- Side-by-side editing

#### 2. Structure Conflicts
**Scenario**: Directory structure changes conflict
**Resolution Options**:
- Merge directory structures
- Preserve project-specific organization
- Update master structure
- Create hybrid organization

#### 3. Agent Definition Conflicts
**Scenario**: Agent definitions modified differently
**Resolution Options**:
- Use project improvements
- Keep master definitions
- Merge capabilities and features
- Create project-specific variants

### Resolution Workflow

#### Interactive Resolution
```
Conflict detected: sub-agents-guide.md
Project: Added 3 new agents, modified 2 existing
Master:  Added 1 new agent, modified 1 existing

Options:
1. Keep project version (recommended)
2. Keep master version
3. Manual merge
4. View differences first

Selection: 1
✅ Using project version - master updated with project improvements
```

#### Automatic Resolution Rules
1. **Project Wins**: When project has more recent substantive changes
2. **Master Wins**: When master has critical updates or fixes
3. **Merge**: When changes are in different sections/areas
4. **Prompt**: When automatic resolution isn't safe

---

## Sync Strategies

### 1. Conservative Sync
**Approach**: Manual review of all changes
**Best For**: Critical projects, first-time setup
**Process**:
- Show all changes before execution
- Require confirmation for each operation
- Create detailed backup before sync
- Provide rollback options

### 2. Smart Sync (Recommended)
**Approach**: Automatic safe operations, prompt for conflicts
**Best For**: Regular workflow usage
**Process**:
- Auto-handle non-conflicting changes
- Prompt only for actual conflicts
- Use intelligent merge strategies
- Provide clear status reporting

### 3. Force Sync
**Approach**: Override conflicts with specified direction
**Best For**: Emergency recovery, major reorganizations
**Process**:
- Force project → master (preserve all project work)
- Force master → project (reset to master state)
- Backup before destructive operations
- Clear confirmation requirements

---

## Usage Examples

### Daily Workflow Sync
```
User: "close"
Claude:
1. ✅ Session archived in session-archives/
2. 🔄 Syncing project changes to master...
3. ✅ 3 files updated in master-files
4. ✅ No conflicts detected
5. 🎉 Closing workflow complete with sync
```

### Project Improvements Sync
```
User: "sync to master"
Claude:
1. 🔍 Analyzing project changes...
2. 📝 Found 5 modified files, 2 new files
3. ✅ Updated opening-workflow-guide.md in master
4. ✅ Added custom-agent-template.md to master
5. ⚠️  Conflict: sub-agents-guide.md (both modified)
6. 🔧 Resolved with project version (more complete)
7. ✅ Sync to master complete - 7 files updated
```

### Getting Latest Updates
```
User: "sync from master"
Claude:
1. 🔍 Checking master for updates...
2. 📥 Found 3 updated files in master
3. ✅ Updated closing-workflow-guide.md
4. ✅ Added new security-checklist.md
5. ✅ Updated project-setup-script.sh
6. ✅ Sync from master complete - project updated
```

### Bidirectional Sync
```
User: "sync bidirectional"
Claude:
1. 🔍 Analyzing changes in both directions...
2. 📊 Project: 4 changes | Master: 2 changes
3. ✅ Auto-merged 5 non-conflicting files
4. ⚠️  1 conflict requires resolution:
   - sub-agents-guide.md: Choose version?
   - [P]roject (3 new agents) or [M]aster (bug fixes)
5. User: P
6. ✅ Bidirectional sync complete - all changes preserved
```

---

## Integration with Existing Workflows

### Enhanced Opening Workflow
**Updated "open" command now**:
1. Copies ~/.claude/master-files to ./Claude_files
2. Executes project-setup-script.sh
3. Creates agent outlines from latest definitions
4. Reports any sync recommendations

### Enhanced Closing Workflow
**Updated "close" command now**:
1. Creates session archive (existing)
2. Automatically syncs project → master (NEW)
3. Reports sync status and any conflicts
4. Provides sync completion confirmation

### Continuous Sync Options
**Optional automated sync triggers**:
- Before major commits
- After significant file changes
- Daily scheduled sync
- Manual sync checkpoints

---

## Best Practices

### Sync Timing
1. **Sync to master**: After completing significant work
2. **Sync from master**: Before starting new projects
3. **Bidirectional sync**: When unsure of sync state
4. **Status check**: Before any major sync operation

### Conflict Prevention
1. **Regular syncing**: Prevent large divergences
2. **Clear ownership**: Define which location is authoritative for specific files
3. **Communication**: Document major changes and their purpose
4. **Backup strategy**: Always backup before major sync operations

### File Organization
1. **Consistent structure**: Maintain same organization in both locations
2. **Clear naming**: Use descriptive names for files and directories
3. **Logical grouping**: Keep related files together
4. **Version tracking**: Consider versioning for major changes

---

## Troubleshooting

### Common Issues

#### 1. Permission Denied
**Cause**: Insufficient file permissions
**Solution**:
```bash
chmod -R u+w ~/.claude/master-files/
chmod -R u+w ./Claude_files/
```

#### 2. Missing Master Directory
**Cause**: ~/.claude/master-files/ not initialized
**Solution**: Run "open" workflow to initialize structure

#### 3. Sync Timestamp Issues
**Cause**: File modification times inconsistent
**Solution**: Force sync or reset timestamps

#### 4. Large Conflicts
**Cause**: Long period without syncing
**Solution**: Use conflict resolution workflow step by step

### Recovery Procedures

#### Restore from Backup
```bash
# Restore master-files from backup
cp -r ~/.claude/master-files-backup/* ~/.claude/master-files/

# Restore project Claude_files from backup
cp -r ./Claude_files-backup/* ./Claude_files/
```

#### Reset Sync State
```bash
# Clear sync timestamps to force fresh analysis
rm ~/.claude/master-files/.sync-timestamp
rm ./Claude_files/.sync-timestamp
```

#### Emergency Recovery
1. **Backup current state** of both locations
2. **Choose authoritative source** (usually project for recent work)
3. **Force sync** from authoritative to target
4. **Validate** result and test functionality
5. **Document** what was lost/changed for future reference

---

## Future Enhancements

### Advanced Features
- **Intelligent merge algorithms** for automatic conflict resolution
- **Version control integration** with git-like tracking
- **Change notifications** and sync reminders
- **Team collaboration** features for shared master-files

### Workflow Integration
- **IDE integration** with sync status indicators
- **Automated triggers** based on file changes
- **Sync scheduling** for regular maintenance
- **Cross-project analytics** for usage patterns

---

**Tags**: #sync #workflows #bidirectional #automation #file-management #conflict-resolution

**Maintenance**: Update this guide as sync capabilities and strategies evolve.