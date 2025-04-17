# Close Terminal Tool Implementation Guide

## Overview
The `close_terminal` tool enables programmatic closure of VSCode terminals, addressing the hanging issue where terminals accumulate during development sessions.

## Current Status
- **Issue**: No way to close terminals programmatically from AI assistant
- **Impact**: Terminal accumulation, resource usage, development workflow disruption
- **Solution**: Implement `close_terminal` tool following VSCode extension patterns

## Technical Requirements

### Tool Schema
```json
{
  "name": "close_terminal",
  "description": "Close a specific VSCode terminal by ID to manage terminal lifecycle",
  "parameters": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string", 
        "description": "Terminal ID from run_in_terminal output or terminal listing"
      },
      "force": {
        "type": "boolean",
        "description": "Force close even if processes are running (default: false)"
      },
      "reason": {
        "type": "string",
        "description": "Optional reason for audit logging"
      }
    },
    "required": ["id"]
  }
}
```

### Implementation Architecture

#### 1. Platform Integration Path
This tool needs to be implemented at the same level as `run_in_terminal`:
- VSCode extension API access required
- Terminal management through `vscode.window.terminals`
- Integration with existing terminal tracking system

#### 2. Core Implementation Logic
```typescript
// Key VSCode APIs needed:
// - vscode.window.terminals (get active terminals)
// - Terminal.dispose() (close terminal)
// - Terminal state checking (safety validation)

async function closeTerminal(id: string, force: boolean = false) {
  // 1. Find terminal by ID
  // 2. Safety checks (unless forced)
  // 3. Call terminal.dispose()
  // 4. Verify closure
  // 5. Return status
}
```

#### 3. Safety Features
- **Active Process Detection**: Check if terminal has running processes
- **Force Override**: Allow override for stuck terminals
- **Confirmation**: Verify terminal actually closed
- **Error Handling**: Graceful failure for invalid IDs

## Use Cases

### Development Workflow
- Clean up after completed builds/tests
- Reset environment when terminals become unresponsive
- Manage terminal clutter during long sessions

### Automation
- Scripted cleanup in testing scenarios
- CI/CD pipeline terminal management
- Session reset workflows

## Implementation Priority
**High** - This addresses a concrete workflow pain point that was explicitly identified and requested.

## Next Steps
1. Identify where VSCode terminal tools are implemented in the platform
2. Add `close_terminal` to the same tool registry/system
3. Test with various terminal states and safety scenarios
4. Document usage patterns for effective terminal management

## Related Tools
- `run_in_terminal` (creates terminals)
- `get_terminal_output` (reads terminal content)
- **`close_terminal`** (closes terminals) ← Missing piece

This completes the terminal lifecycle management trinity.
