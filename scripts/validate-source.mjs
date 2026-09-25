#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourceRoots = ['src'];
const files = [];
for (const relativeRoot of sourceRoots) {
  const absoluteRoot = path.join(root, relativeRoot);
  if (!fs.existsSync(absoluteRoot)) continue;
  const stack = [absoluteRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (/\.(ts|tsx|py)$/.test(entry.name)) files.push(absolute);
    }
  }
}

const errors = [];
const warnings = [];
const forbidden = [
  { regex: /AWS_SECRET_ACCESS_KEY\s*=/, message: 'Source code must not contain AWS secret environment assignments.' },
  { regex: /AKIA[0-9A-Z]{16}/, message: 'A possible AWS access-key literal was found.' },
  { regex: /http:\/\/localhost(?::\d+)?/g, message: 'Source should not hard-code localhost as a production endpoint.' },
];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  for (const rule of forbidden) {
    if (rule.regex.test(text)) errors.push(`${rel}: ${rule.message}`);
    rule.regex.lastIndex = 0;
  }
  if (/fontWeight\s*:\s*['"](?:850|950)['"]/.test(text)) warnings.push(`${rel}: non-standard RN fontWeight detected; use 100-900 values.`);
  if (/Share\.share\(/.test(text) && !/try\s*\{/.test(text)) warnings.push(`${rel}: Share.share should be wrapped in error handling.`);
}

console.log(`Static source validation: ${files.length} source files inspected.`);
for (const error of errors) console.error(`ERROR: ${error}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
console.log(`Errors: ${errors.length}; warnings: ${warnings.length}`);
if (errors.length) process.exit(1);
