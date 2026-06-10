# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **`Item.perform_update()`** — failed PATCH requests now reject with the original storage/HTTP error instead of masking it with `ReferenceError: patchData is not defined`.

### Changed

- npm package name is **`@logimaxx/kviews.js`** (renamed from `@logimaxx/kviews`). Install with `npm install @logimaxx/kviews.js`.

## [1.2.1]

### Changed

- **`docs/examples/test.html`** — remade as a posts board demo with a two-column layout (collection + detail), compose form, and local JSON only (no external API).
- **`docs/examples/demo.css`** — self-contained styles for the example page (replaces Bootstrap in the demo).
- **`docs/examples/posts.json`** and **`post-1.json`** — JSON:API sample data with authors in `included`, status badges, and excerpts.
- **`docs/examples/collection.json`** and **`item.json`** — aligned with the posts example model.
- Removed legacy **`companies.json`** / **`company-1.json`** example files.

## [1.2.0] - 2026-05-20

### Changed

- npm package name is **`@logimaxx/kviews`** (unscoped `kviews` is blocked by npm as too similar to `iview`). Install with `npm install @logimaxx/kviews`.
- Release checklist script is now **`scripts/release.mjs`** (replaces `scripts/release.sh`).

### Added

- **Data adapters** — pluggable wire-format layer; default remains JSON:API (`adapter: 'jsonapi'`).
- **`PlainRestAdapter`** — built-in plain REST support via `adapter: 'plain'`.
- **`JsonApiAdapter`** — existing JSON:API parsing and serialization extracted into the default adapter.
- **`loadFromRemoteDoc()`** on `Item` — adapter-aware remote load; `loadFromJSONAPIDoc()` deprecated.
- **`KViews.defaultAdapter`**, **`KViews.registerAdapter()`** — global default and custom adapter registration.
- Exports: `JsonApiAdapter`, `PlainRestAdapter`, `resolveAdapter`, `registerAdapter`, `setDefaultAdapter`, `getDefaultAdapter`.
- Documentation: [docs/guides/adapters.md](docs/guides/adapters.md) and API updates for the `adapter` option.
- **`KViews.defaultHeaders`** (and `apiBaseConfig.defaultHeaders`) for default HTTP headers on every `fetch`.
- Per-instance **`headers`** and **`ajaxOpts`** for collections and items; documented merge order in `README.md` and `docs/`.
- **`KViews.basePath`** documented alongside `KViews.baseUrl` for resolving relative request URLs.
- **`CODE_OF_CONDUCT.md`** and **`SUPPORT.md`**; npm package `files` include community docs.
- Unit tests for adapters (`tests/unit/adapters.test.js`, `tests/unit/plain-rest-integration.test.js`).

### Fixed

- `createOverlay` returns a valid jQuery chain and uses `document.createElement("div")` for reliable DOM creation.
- `getRenderContext` includes `type` on flattened relationship objects, consistent with docs and tests.
- Test jQuery mock: two-argument `.data(key, value)` chains like jQuery even when `value` is `undefined`.

## [1.1.3] - 2026-05-04

### Fixed

- Item update and render-context fixes; test and documentation alignment (see git history for detail).

## [1.1.2] - 2026-05-04

Earlier releases — see git tags and commit history.
