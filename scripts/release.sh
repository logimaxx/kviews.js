#!/usr/bin/env bash
# Run before a version bump / npm publish: tests + refresh committed dist bundles.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo ">>> kviews — release prep (test + build)"
echo

npm test
npm run build

echo
if git rev-parse --git-dir >/dev/null 2>&1; then
  pending="$(git status --porcelain -- dist website/dist 2>/dev/null || true)"
  if [[ -n "${pending}" ]]; then
    echo "Build output not yet committed:"
    echo "${pending}"
    echo
    echo "Stage and commit before npm version (npm version requires a clean tree):"
    echo "  git add dist website/dist && git commit -m \"chore: refresh dist\""
  else
    echo "dist/ and website/dist/ match the index (nothing new from this build)."
  fi
fi

echo
echo "Then version, publish, and push tags:"
echo "  npm version patch   # or minor | major"
echo "  npm publish"
echo "  git push && git push --tags"
echo
echo "Shortcut after commit: ./version.sh patch  (bumps version + pushes; run npm publish yourself if needed)"
