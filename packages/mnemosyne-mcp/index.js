import { spawn } from 'child_process';
import path from 'path';

export function startLocalServer(port = 8000) {
  const env = Object.assign({}, process.env, { PORT: String(port) });

  // Compute repository root (two levels up from this package dir)
  const repoRoot = new URL('../..', import.meta.url).pathname;

  // Run tsx from the repository root so paths resolve correctly
  const child = spawn('npx', ['tsx', 'src/server.ts'], {
    stdio: 'inherit',
    env,
    cwd: repoRoot
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error('Local MCP server exited with code', code);
    }
  });

  child.on('error', (err) => {
    console.error('Failed to start local MCP server process:', err);
  });

  return child;
}

export default { startLocalServer };
