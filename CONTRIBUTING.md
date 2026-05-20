# Contributing to KViews

Thank you for helping improve KViews.

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Development setup

```bash
git clone https://github.com/logimaxx/kviews.git
cd kviews
npm install
```

## Checks before you open a PR

1. **Tests** — all Vitest tests should pass:

   ```bash
   npm test
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
- Update user-facing docs (`README.md`, `docs/`) when the public API or install story changes. Any HTML or “quick start” snippet that loads KViews should mention **jQuery** and **Handlebars** as runtime dependencies (load **jQuery → Handlebars → KViews**).

## Pull requests

- One logical change per PR when possible.
- Describe **what** changed and **why** in the PR description.

## Publishing (maintainers)

See **[RELEASE_FLOW.md](./RELEASE_FLOW.md)** for the full checklist (tests, build, version bump, `CHANGELOG.md`, `npm publish`, tags).

Briefly: `npm publish` runs `prepack`, which runs `npm run build`, so `dist/` in the tarball matches the sources. Bump `package.json` (for example with `npm version patch`) only after `[Unreleased]` in `CHANGELOG.md` is ready for that version.
