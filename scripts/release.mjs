#!/usr/bin/env node
/**
 * Release prep: run tests, build bundles, remind about committing dist/
 * when the repo tracks those paths. Uses Node only (no bash) for portability.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** @param {string[]} args npm CLI args after `npm` */
function runNpm(args) {
  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  const status = result.status ?? 1;
  if (status !== 0) process.exit(status);
}

function gitAvailable() {
  const r = spawnSync('git', ['rev-parse', '--git-dir'], {
    cwd: root,
    stdio: 'ignore',
    shell: false,
  });
  return r.status === 0;
}

function porcelainDistDirs() {
  const r = spawnSync(
    'git',
    ['status', '--porcelain', '--', 'dist', 'website/dist'],
    { cwd: root, encoding: 'utf8', shell: false }
  );
  if (r.status !== 0 || typeof r.stdout !== 'string') return '';
  return r.stdout.trimEnd();
}

console.log('>>> kviews — release prep (test + build)');
console.log('');

runNpm(['test']);
runNpm(['run', 'build']);

console.log('');
if (gitAvailable()) {
  const pending = porcelainDistDirs();
  if (pending) {
    console.log('Build output not yet committed:');
    console.log(pending);
    console.log('');
    console.log('Stage and commit before npm version (npm version requires a clean tree):');
    console.log('  git add dist website/dist && git commit -m "chore: refresh dist"');
  } else {
    console.log('dist/ and website/dist/ match the index (nothing new from this build).');
  }
}

console.log('');
console.log('Then version, publish, and push tags:');
console.log('  npm version patch   # or minor | major');
console.log('  npm publish');
console.log('  git push && git push --tags');
console.log('');
console.log(
  'Shortcut after commit (Unix): ./version.sh patch  — bumps version + pushes; run npm publish yourself if needed'
);
