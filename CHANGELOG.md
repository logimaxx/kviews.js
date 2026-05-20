# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- npm package name is **`@logimaxx/kviews`** (unscoped `kviews` is blocked by npm as too similar to `iview`). Install with `npm install @logimaxx/kviews`.

### Added

- **Data adapters** — pluggable wire-format layer; default remains JSON:API (`adapter: 'jsonapi'`).
- **`PlainRestAdapter`** — built-in plain REST support via `adapter: 'plain'`.
- **`loadFromRemoteDoc()`** on `Item` — adapter-aware remote load; `loadFromJSONAPIDoc()` deprecated.
- **`KViews.defaultAdapter`**, **`KViews.registerAdapter()`** — global default and custom adapter registration.
- Exports: `JsonApiAdapter`, `PlainRestAdapter`, `resolveAdapter`, `registerAdapter`, `setDefaultAdapter`, `getDefaultAdapter`.
- Documentation: [docs/guides/adapters.md](docs/guides/adapters.md) and API updates for `adapter` option.
- `KViews.defaultHeaders` (and `apiBaseConfig.defaultHeaders`) for default HTTP headers on every `fetch`.
- Per-instance `headers` and `ajaxOpts` for collections and items; documented merge order in `README.md` and `docs/`.
- `KViews.basePath` documented alongside `KViews.baseUrl` for resolving relative request URLs.

### Fixed

- `createOverlay` returns a valid jQuery chain and uses `document.createElement("div")` for reliable DOM creation.
- `getRenderContext` includes `type` on flattened relationship objects, consistent with docs and tests.
- Test jQuery mock: two-argument `.data(key, value)` chains like jQuery even when `value` is `undefined`.
