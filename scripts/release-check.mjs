#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const commands = [
  ['node', ['scripts/validate-release.mjs']],
  ['node', ['scripts/validate-source.mjs']],
  ['python3', ['-m', 'compileall', '-q', 'server']],
];

let failed = false;
for (const [command, args] of commands) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
