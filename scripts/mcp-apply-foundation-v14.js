// Node.js MCP client to apply Foundation v1.4.0 via the memory_update_foundation tool
// File: scripts/mcp-apply-foundation-v14.js
// Usage:
//   WORKER_URL=https://your-worker.workers.dev/mcp AUTH_TOKEN=your_token node scripts/mcp-apply-foundation-v14.js

const WORKER_URL = process.env.WORKER_URL || "https://your-worker.workers.dev/mcp"; // Replace or set via env
const AUTH_TOKEN = process.env.AUTH_TOKEN || null; // Optional: Bearer token for protected endpoints

// Full Foundation v1.4.0 migration object (inlined)
const migration = {
  version: "1.4.0",
  description: "Terminal handling protocols: ephemeral lifecycle, safe naming, no interference, cleanup discipline, and sendCommand preference",
  coreRules: [
    {
      id: "terminal-ephemeral-lifecycle",
      rule: "Terminals are ephemeral by default: create→execute→destroy. Persist only for long-running processes.",
      description: "Terminals must be created only when necessary for a single-purpose command or long-running process, and cleaned up immediately after use.",
      priority: "critical",
      enforcement: "strict",
      examples: [
        "✅ Create terminal to run a specific command and destroy it after completion",
        "✅ Keep terminals alive only for servers or builds that must remain running",
        "❌ Leaving ephemeral terminals idle after command execution"
      ]
    },
    {
      id: "terminal-random-hex-naming",
      rule: "Use random hex-based names for agent-created terminals (e.g., cmd-a3f7b9) to avoid collisions and clearly mark agent terminals.",
      description: "Randomized naming prevents accidental interaction with user terminals and makes agent-owned terminals obvious.",
      priority: "high",
      enforcement: "advisory",
      examples: [
        "✅ Name terminals like \"cmd-a3f7b9\"",
        "❌ Use predictable or user-like terminal names that could collide"
      ]
    },
    {
      id: "terminal-no-interference",
      rule: "Never interact with or modify terminals not created by the agent.",
      description: "Protect user-owned terminals by never attaching to or sending commands to them.",
      priority: "critical",
      enforcement: "strict",
      examples: [
        "✅ Always check ownership before sending commands",
        "❌ Attaching to existing user terminals or reusing their sessions"
      ]
    },
    {
      id: "terminal-cleanup-discipline",
      rule: "Destroy ephemeral terminals immediately after their task completes; detect and alert when accumulated dead terminals indicate lifecycle issues.",
      description: "Maintain cleanup discipline; implement guard that triggers when multiple dead/idle terminals accumulate.",
      priority: "high",
      enforcement: "strict",
      examples: [
        "✅ Destroy terminal after command exit",
        "✅ Trigger alert when >3 idle agent terminals exist without long-running processes"
      ]
    },
    {
      id: "terminal-sendCommand-preference",
      rule: "Prefer using sendCommand which handles terminal lifecycle automatically instead of manual terminal creation when available.",
      description: "Use higher-level APIs that manage terminal lifecycle and observation, reducing risk of leaked or interactive terminals.",
      priority: "medium",
      enforcement: "advisory",
      examples: [
        "✅ Use sendCommand to execute commands non-interactively",
        "✅ Reserve manual terminal creation for advanced or diagnostic cases only"
      ]
    }
  ],
  essentialPatterns: [
    {
      pattern: "terminal-ephemeral-pattern",
      description: "Create → Execute → Destroy lifecycle for ephemeral terminals",
      desiredOutcome: "positive",
      interventions: [
        "Validate lifecycle on every terminal use",
        "Log creation and destruction events",
        "Run periodic checks for idle agent terminals"
      ]
    },
    {
      pattern: "terminal-naming-clarity",
      description: "Agent-created terminals use unambiguous names",
      desiredOutcome: "positive",
      interventions: [
        "Generate random hex names for terminals",
        "Document naming convention in project memory"
      ]
    }
  ],
  safetyConstraints: [
    {
      constraint: "no-interference-with-user-terminals",
      rationale: "Prevent accidental modification or inspection of user terminals",
      enforcement: "hard-stop"
    },
    {
      constraint: "require-output-observation-for-actions",
      rationale: "Do not proceed with consequential steps if terminal output cannot be observed",
      enforcement: "warning"
    }
  ],
  metadata: {
    author: "Athena (agent)",
    timestamp: "2025-08-24T00:00:00.000Z",
    changelog: ["v1.4.0: Formalized terminal handling protocols"],
    compatibleWith: ["1.3.0", "1.2.0"],
    replaces: "1.3.0",
    notes: "Formalizes terminal handling as foundation rules per user instruction"
  }
};

const options = {
  mergeRules: true,
  preserveViolations: true,
  backup: true,
  dryRun: false
};

async function callMcp() {
  const payload = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: {
      name: "memory_update_foundation",
      arguments: {
        migration,
        options
      }
    }
  };

  const headers = { "Content-Type": "application/json" };
  if (AUTH_TOKEN) headers["Authorization"] = `Bearer ${AUTH_TOKEN}`;

  console.log(`Calling MCP at ${WORKER_URL} with migration version ${migration.version} (dryRun=${options.dryRun})`);

  const resp = await fetch(WORKER_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const text = await resp.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    console.error("Non-JSON response:", text);
  }

  if (!resp.ok) {
    console.error(`HTTP ${resp.status} ${resp.statusText}`);
    console.error(parsed || text);
    process.exitCode = 1;
    return;
  }

  console.log("MCP response:", JSON.stringify(parsed, null, 2));
}

callMcp().catch(err => {
  console.error("Failed to call MCP:", err);
  process.exitCode = 1;
});
