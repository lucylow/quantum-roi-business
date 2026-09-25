#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const bannedNames = new Set([
  '.env', '.env.production', '.env.local',
  'credentials.json', 'aws-credentials.json',
]);
const matches = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '.expo', 'build'].includes(entry.name)) walk(full);
      continue;
    }
    if (bannedNames.has(entry.name)) matches.push(path.relative(root, full));
  }
}
walk(root);

if (matches.length) {
  console.error('Sensitive configuration files detected in the release tree:');
  for (const match of matches) console.error(`- ${match}`);
  process.exit(1);
}
console.log('No disallowed credential/config files detected in the release tree.');
