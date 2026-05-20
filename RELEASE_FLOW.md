# Release flow

Maintainers: use this checklist so npm, git tags, and docs stay aligned.

## Before you cut a release

1. Finish changes in `src/` and update user-facing docs if the public API or install story changed.
2. Ensure [CHANGELOG.md](CHANGELOG.md) has a dated section for the new version (move items out of **[Unreleased]** when you bump the version).

## Build and verify

```bash
npm install
npm run release   # runs tests + build; reminds you to commit dist/ if dirty
```

Alternatively: `npm test` and `npm run build` separately.

## Commit build artifacts (if your process ships them)

If **`npm run release`** ([`scripts/release.mjs`](scripts/release.mjs)) or `git status` shows uncommitted `dist/` or `website/dist/` output, add and commit those files so GitHub Pages and clones match the published version.

## Version and publish

```bash
npm version patch   # or minor / major
npm publish         # scoped package: @logimaxx/kviews (publishConfig.access: public)
git push && git push --tags
```

`npm publish` runs `prepack`, which runs `npm run build`, so the tarball’s `dist/` matches the tree you just built.

## After publish

- Confirm the new version on [npm](https://www.npmjs.com/package/@logimaxx/kviews).
- If you use GitHub Releases, add release notes that mirror the relevant [CHANGELOG.md](CHANGELOG.md) section.
