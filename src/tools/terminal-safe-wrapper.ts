// terminal-safe-wrapper.ts
// Wraps terminal command execution with pre-violation assessment (Phase 1)

import { memory_assess_action } from '../modules/previolation-assessment';

export async function runInTerminalSafe(command: string, context?: Record<string, unknown>) {
  const assessment = await memory_assess_action('terminal', command, context);

  if (assessment.riskLevel === 'stop') {
    throw new Error(`Execution halted: ${assessment.reasoning}`);
  }
  if (assessment.riskLevel === 'ask') {
    // TODO: Prompt user (integration in agent interface)
    throw new Error(`User decision required: ${assessment.reasoning}`);
  }
  if (assessment.riskLevel === 'caution') {
    // TODO: Issue warning, proceed with caution (agent config)
    console.warn(`Caution: ${assessment.reasoning}`);
  }
  // If proceed, or after user confirms 'ask':
  return runInTerminal(command); // Delegate to original runner
}

// Placeholder for the native runner
declare function runInTerminal(cmd: string): Promise<unknown>;
