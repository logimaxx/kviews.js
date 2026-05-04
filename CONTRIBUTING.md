# Contributing to KViews

Thank you for helping improve KViews.

## Development setup

```bash
git clone https://github.com/logimaxx/kviews.git
cd kviews
npm install
```

## Checks before you open a PR

1. **Tests** — all Vitest tests should pass:

   ```bash
   npm test -- --run
   ```

2. **Build** — the IIFE bundle should build without errors:

   ```bash
   npm run build
   ```

3. **End-to-end tests** (optional locally; CI can be extended to run them):

   ```bash
   npm run test:e2e
   ```

## Guidelines

- Match the existing style in the files you touch.
- Add or update tests for behavior changes.
- Update user-facing docs (`README.md`, `docs/`) when the public API or install story changes.

## Pull requests

- One logical change per PR when possible.
- Describe **what** changed and **why** in the PR description.

## Publishing (maintainers)

`npm publish` runs `prepack`, which runs `npm run build`, so `dist/` is up to date in the published tarball. Ensure `package.json` version is bumped (for example with `npm version patch`) and `CHANGELOG.md` is updated before tagging a release.
