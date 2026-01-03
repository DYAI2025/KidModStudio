# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 🎮 KidModStudio Project

## Project Overview

**KidModStudio** is a children-focused Minecraft mod creation platform being developed in German. The project enables kids to create Minecraft mods through an intuitive visual interface, voice commands, and an AI assistant named "Crafty". The platform exports Fabric mods for Minecraft 1.21.x.

### Core Concept
- **Target Users**: Children (German-speaking)
- **No-Fake Foundation**: UI elements only appear when underlying functionality is truly implemented
- **Local-First**: Voice recognition (STT/TTS) and LLM (Ollama) run locally for privacy and reliability
- **Export Target**: Fabric mods for Minecraft 1.21.x (not multi-loader in MVP)

## Project Architecture

The full project plan is documented in `Project-Minecraft-kidsmod.md` with a 6-sprint MVP roadmap.

### Key Components

1. **Workbench UI** (3-column layout)
   - ItemLibraryPanel: Curated objects/mobs (8-20 items)
   - Crafting3DView: Three.js-based preview with HUD overlay
   - PropertiesPanel: Element/Level/Trigger configuration with checklist

2. **Domain Model**
   - **Elements**: Fire, Ice, Water, Poison, Healing, Lightning, Light
   - **Levels**: Intensity (1-3)
   - **Triggers**: Use (right-click), Hit (attack) - MVP limitation

3. **Exporter**
   - Fabric-only for MVP (templates/fabric-1.21.x/)
   - Uses versionable Fabric templates
   - Must generate buildable Fabric mod structure
   - Includes "KidModStudio" ItemGroup tab for testing

4. **Crafty Assistant**
   - Voice-driven workflow (German)
   - WebSocket-based Voice Service (STT/TTS)
   - Local LLM via Ollama with JSON schema enforcement
   - Skills system with audit ledger
   - Confirm pattern: proposes actions, waits for "Ja" confirmation

5. **No-Fake Architecture**
   - CI scanner breaks build on stub/mock patterns in production path
   - Export/Crafty buttons hidden when services unavailable
   - Error catalog with child-friendly messages

## Sprint-Based Development Plan

The project follows 2-week sprints with strict Definition of Done criteria:

- **Sprint 0**: No-Fake Foundation (CI scanner, UI shell)
- **Sprint 1**: Save/Load functionality with atomic saves + backup
- **Sprint 2**: Live Workbench with Element/Level/Trigger + 3D preview
- **Sprint 3**: Export & Test - real Fabric mod output (MVP-0.0.1)
- **Sprint 4**: Crafty Voice integration (local STT/TTS)
- **Sprint 5**: LLM + Skills voice-driven mod creation (MVP-0.0.2)
- **Sprint 6**: Content expansion, effects, stability

### Definition of Done (Each Sprint)
- ✅ No-Stub Gate passes (or exists and blocks violations)
- ✅ Tests run in CI (Unit/Smoke/Golden as appropriate)
- ✅ Demo script executable (1-2 minutes, reproducible)
- ✅ User value measurable
- ✅ No clickable fakes (buttons only active when feature is real)

## Referenced MCreator Plugins

This repository contains archived reference implementations:

### Fabric Generator (Fabric-Generator-MCreator-1.21.8.zip)
- MCreator plugin for Fabric mod generation
- Template-based code generation using FreeMarker (.ftl files)
- Located: `src/main/resources/fabric-1.21.8/`
- Key files:
  - `generator.yaml`: Generator configuration
  - `templates/`: FreeMarker templates for mod components
  - `procedures/`: Game logic templates
  - `workspacebase/`: Gradle build structure

**Build Commands** (for Fabric Generator plugin):
```bash
# Build the plugin
./gradlew build

# Install plugin to MCreator
./gradlew install

# Run MCreator with plugin
./gradlew runMCreator

# Run tests
./gradlew test
```

### Other Reference Archives
- `MCreator-master.zip`: Main MCreator codebase reference
- `allium-main.zip`: Additional reference
- `Backpacked-multiloader-1.21.1.zip`: Multi-loader pattern reference (future use)
- `Cardinal-Components-API-1.21.zip`: Fabric API reference

## Key Technical Decisions

### Fabric-Only MVP
- Single Minecraft version target: 1.21.x
- No multi-loader (Fabric/NeoForge) in MVP
- Reduces complexity, faster to market
- Templates located in: `templates/fabric-<mcVersion>/`

### Trigger Limitations (MVP)
- Only 2 triggers supported initially:
  - **Use**: Right-click action
  - **Hit**: Attack/damage action
- "Open container" and other triggers deferred post-MVP
- UI only shows chips for implemented triggers (No-Fake principle)

### Child-Friendly UX Principles
- German language throughout
- Short sentences, clear icons/emojis
- 1-2 clicks per action maximum
- Clear "What next?" guidance (mini-stepper UI)
- Reizarm-Modus (low-stimulation mode) toggle

## Testing Requirements

### Test Types
- **Golden Tests**: Save/Load roundtrip, Voice vs UI determinism
- **Smoke Tests**: Exporter output validation
- **No-Stub Scanner**: CI enforced pattern detection

## Important Constraints

- **No "Coming Soon" buttons**: If feature isn't implemented, don't show the UI
- **No stub providers in production path**: Echo/Mock providers must be quarantined
- **Validate exports**: Generated mods must actually build and run in Minecraft
- **Child-safe errors**: Error messages must be kind, brief, with clear recovery steps
- **Deterministic voice flows**: Voice commands must produce identical results to UI actions

## Development Workflow (When Implemented)

1. **No modifications without reading**: Always read existing code before suggesting changes
2. **Respect No-Fake principle**: Never create UI elements for non-existent functionality
3. **Child-first design**: All UX decisions prioritize clarity for children
4. **Fabric-only**: Don't introduce multi-loader complexity
5. **Local-first**: Voice/LLM must work without cloud dependencies
6. **Sprint-based**: Work aligns to current sprint goals in project plan

---

# 🚀 Claude Flow Development Environment

This repository uses Claude Flow with SPARC methodology for systematic development when implementing the KidModStudio project.

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 🎯 CRITICAL: Claude Code Task Tool for Agent Execution

**Claude Code's Task tool is the PRIMARY way to spawn agents:**
```javascript
// ✅ CORRECT: Use Claude Code's Task tool for parallel agent execution
[Single Message]:
  Task("Research agent", "Analyze requirements and patterns...", "researcher")
  Task("Coder agent", "Implement core features...", "coder")
  Task("Tester agent", "Create comprehensive tests...", "tester")
  Task("Reviewer agent", "Review code quality...", "reviewer")
  Task("Architect agent", "Design system architecture...", "system-architect")
```

**MCP tools are ONLY for coordination setup:**
- `mcp__claude-flow__swarm_init` - Initialize coordination topology
- `mcp__claude-flow__agent_spawn` - Define agent types for coordination
- `mcp__claude-flow__task_orchestrate` - Orchestrate high-level workflows

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation and markdown files
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/examples` - Example code

## SPARC Commands

### Core Commands
- `npx claude-flow sparc modes` - List available modes
- `npx claude-flow sparc run <mode> "<task>"` - Execute specific mode
- `npx claude-flow sparc tdd "<feature>"` - Run complete TDD workflow
- `npx claude-flow sparc info <mode>` - Get mode details

### Batchtools Commands
- `npx claude-flow sparc batch <modes> "<task>"` - Parallel execution
- `npx claude-flow sparc pipeline "<task>"` - Full pipeline processing
- `npx claude-flow sparc concurrent <mode> "<tasks-file>"` - Multi-task processing

## SPARC Workflow Phases

1. **Specification** - Requirements analysis (`sparc run spec-pseudocode`)
2. **Pseudocode** - Algorithm design (`sparc run spec-pseudocode`)
3. **Architecture** - System design (`sparc run architect`)
4. **Refinement** - TDD implementation (`sparc tdd`)
5. **Completion** - Integration (`sparc run integration`)

## Code Style & Best Practices

- **Modular Design**: Files under 500 lines
- **Environment Safety**: Never hardcode secrets
- **Test-First**: Write tests before implementation
- **Clean Architecture**: Separate concerns
- **Documentation**: Keep updated
- **Child-First UX**: All UI decisions prioritize children (for KidModStudio)
- **No-Fake Foundation**: Only show implemented features (for KidModStudio)

## 🚀 Available Agents (64+ Total)

### Core Development
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### Swarm Coordination
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`, `collective-intelligence-coordinator`, `swarm-memory-manager`

### Consensus & Distributed
`byzantine-coordinator`, `raft-manager`, `gossip-coordinator`, `consensus-builder`, `crdt-synchronizer`, `quorum-manager`, `security-manager`

### Performance & Optimization
`perf-analyzer`, `performance-benchmarker`, `task-orchestrator`, `memory-coordinator`, `smart-agent`

### GitHub & Repository
`github-modes`, `pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`, `workflow-automation`, `project-board-sync`, `repo-architect`, `multi-repo-swarm`

### SPARC Methodology
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`, `refinement`

### Specialized Development
`backend-dev`, `mobile-dev`, `ml-developer`, `cicd-engineer`, `api-docs`, `system-architect`, `code-analyzer`, `base-template-generator`

### Testing & Validation
`tdd-london-swarm`, `production-validator`

### Migration & Planning
`migration-planner`, `swarm-init`

## 🎯 Claude Code vs MCP Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn and run agents concurrently for actual work
- File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
- Code generation and programming
- Bash commands and system operations
- Implementation work
- Project navigation and analysis
- TodoWrite and task management
- Git operations
- Package management
- Testing and debugging

### MCP Tools ONLY COORDINATE:
- Swarm initialization (topology setup)
- Agent type definitions (coordination patterns)
- Task orchestration (high-level planning)
- Memory management
- Neural features
- Performance tracking
- GitHub integration

**KEY**: MCP coordinates the strategy, Claude Code's Task tool executes with real agents.

## 🚀 Quick Setup

```bash
# Add MCP servers (Claude Flow required, others optional)
claude mcp add claude-flow npx claude-flow@alpha mcp start
claude mcp add ruv-swarm npx ruv-swarm mcp start  # Optional: Enhanced coordination
claude mcp add flow-nexus npx flow-nexus@latest mcp start  # Optional: Cloud features
```

## MCP Tool Categories

### Coordination
`swarm_init`, `agent_spawn`, `task_orchestrate`

### Monitoring
`swarm_status`, `agent_list`, `agent_metrics`, `task_status`, `task_results`

### Memory & Neural
`memory_usage`, `neural_status`, `neural_train`, `neural_patterns`

### GitHub Integration
`github_swarm`, `repo_analyze`, `pr_enhance`, `issue_triage`, `code_review`

### System
`benchmark_run`, `features_detect`, `swarm_monitor`

### Flow-Nexus MCP Tools (Optional Advanced Features)
Flow-Nexus extends MCP capabilities with 70+ cloud-based orchestration tools:

**Key MCP Tool Categories:**
- **Swarm & Agents**: `swarm_init`, `swarm_scale`, `agent_spawn`, `task_orchestrate`
- **Sandboxes**: `sandbox_create`, `sandbox_execute`, `sandbox_upload` (cloud execution)
- **Templates**: `template_list`, `template_deploy` (pre-built project templates)
- **Neural AI**: `neural_train`, `neural_patterns`, `seraphina_chat` (AI assistant)
- **GitHub**: `github_repo_analyze`, `github_pr_manage` (repository management)
- **Real-time**: `execution_stream_subscribe`, `realtime_subscribe` (live monitoring)
- **Storage**: `storage_upload`, `storage_list` (cloud file management)

**Authentication Required:**
- Register: `mcp__flow-nexus__user_register` or `npx flow-nexus@latest register`
- Login: `mcp__flow-nexus__user_login` or `npx flow-nexus@latest login`
- Access 70+ specialized MCP tools for advanced orchestration

## 🚀 Agent Execution Flow with Claude Code

### The Correct Pattern:

1. **Optional**: Use MCP tools to set up coordination topology
2. **REQUIRED**: Use Claude Code's Task tool to spawn agents that do actual work
3. **REQUIRED**: Each agent runs hooks for coordination
4. **REQUIRED**: Batch all operations in single messages

### Example Full-Stack Development:

```javascript
// Single message with all agent spawning via Claude Code's Task tool
[Parallel Agent Execution]:
  Task("Backend Developer", "Build REST API with Express. Use hooks for coordination.", "backend-dev")
  Task("Frontend Developer", "Create React UI. Coordinate with backend via memory.", "coder")
  Task("Database Architect", "Design PostgreSQL schema. Store schema in memory.", "code-analyzer")
  Task("Test Engineer", "Write Jest tests. Check memory for API contracts.", "tester")
  Task("DevOps Engineer", "Setup Docker and CI/CD. Document in memory.", "cicd-engineer")
  Task("Security Auditor", "Review authentication. Report findings via hooks.", "reviewer")

  // All todos batched together
  TodoWrite { todos: [...8-10 todos...] }

  // All file operations together
  Write "backend/server.js"
  Write "frontend/App.jsx"
  Write "database/schema.sql"
```

## 📋 Agent Coordination Protocol

### Every Agent Spawned via Task Tool MUST:

**1️⃣ BEFORE Work:**
```bash
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

**2️⃣ DURING Work:**
```bash
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/[agent]/[step]"
npx claude-flow@alpha hooks notify --message "[what was done]"
```

**3️⃣ AFTER Work:**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task]"
npx claude-flow@alpha hooks session-end --export-metrics true
```

## 🎯 Concurrent Execution Examples

### ✅ CORRECT WORKFLOW: MCP Coordinates, Claude Code Executes

```javascript
// Step 1: MCP tools set up coordination (optional, for complex tasks)
[Single Message - Coordination Setup]:
  mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 6 }
  mcp__claude-flow__agent_spawn { type: "researcher" }
  mcp__claude-flow__agent_spawn { type: "coder" }
  mcp__claude-flow__agent_spawn { type: "tester" }

// Step 2: Claude Code Task tool spawns ACTUAL agents that do the work
[Single Message - Parallel Agent Execution]:
  // Claude Code's Task tool spawns real agents concurrently
  Task("Research agent", "Analyze API requirements and best practices. Check memory for prior decisions.", "researcher")
  Task("Coder agent", "Implement REST endpoints with authentication. Coordinate via hooks.", "coder")
  Task("Database agent", "Design and implement database schema. Store decisions in memory.", "code-analyzer")
  Task("Tester agent", "Create comprehensive test suite with 90% coverage.", "tester")
  Task("Reviewer agent", "Review code quality and security. Document findings.", "reviewer")

  // Batch ALL todos in ONE call
  TodoWrite { todos: [
    {id: "1", content: "Research API patterns", status: "in_progress", priority: "high"},
    {id: "2", content: "Design database schema", status: "in_progress", priority: "high"},
    {id: "3", content: "Implement authentication", status: "pending", priority: "high"},
    {id: "4", content: "Build REST endpoints", status: "pending", priority: "high"},
    {id: "5", content: "Write unit tests", status: "pending", priority: "medium"},
    {id: "6", content: "Integration tests", status: "pending", priority: "medium"},
    {id: "7", content: "API documentation", status: "pending", priority: "low"},
    {id: "8", content: "Performance optimization", status: "pending", priority: "low"}
  ]}

  // Parallel file operations
  Bash "mkdir -p app/{src,tests,docs,config}"
  Write "app/package.json"
  Write "app/src/server.js"
  Write "app/tests/server.test.js"
  Write "app/docs/API.md"
```

### ❌ WRONG (Multiple Messages):
```javascript
Message 1: mcp__claude-flow__swarm_init
Message 2: Task("agent 1")
Message 3: TodoWrite { todos: [single todo] }
Message 4: Write "file.js"
// This breaks parallel coordination!
```

## Performance Benefits

- **84.8% SWE-Bench solve rate**
- **32.3% token reduction**
- **2.8-4.4x speed improvement**
- **27+ neural models**

## Hooks Integration

### Pre-Operation
- Auto-assign agents by file type
- Validate commands for safety
- Prepare resources automatically
- Optimize topology by complexity
- Cache searches

### Post-Operation
- Auto-format code
- Train neural patterns
- Update memory
- Analyze performance
- Track token usage

### Session Management
- Generate summaries
- Persist state
- Track metrics
- Restore context
- Export workflows

## Advanced Features (v2.0.0)

- 🚀 Automatic Topology Selection
- ⚡ Parallel Execution (2.8-4.4x speed)
- 🧠 Neural Training
- 📊 Bottleneck Analysis
- 🤖 Smart Auto-Spawning
- 🛡️ Self-Healing Workflows
- 💾 Cross-Session Memory
- 🔗 GitHub Integration

## Integration Tips

1. Start with basic swarm init
2. Scale agents gradually
3. Use memory for context
4. Monitor progress regularly
5. Train patterns from success
6. Enable hooks automation
7. Use GitHub tools first

## Support

- Documentation: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues
- Flow-Nexus Platform: https://flow-nexus.ruv.io (registration required for cloud features)

---

## Key Project Files

- **Project-Minecraft-kidsmod.md**: Complete sprint plan, requirements, Definition of Done
- **Fabric-Generator-MCreator-1.21.8.zip**: Reference Fabric generator implementation
  - Extract to examine template structure and Gradle build
  - Located: `src/main/resources/fabric-1.21.8/`

---

# 📝 Important Instruction Reminders

**Remember: Claude Flow coordinates, Claude Code creates!**

- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- Never save working files, text/mds and tests to the root folder
- **KidModStudio Specific**: Respect No-Fake Foundation - never create UI for non-existent features
- **KidModStudio Specific**: All UX must be child-friendly (German, simple, clear)
