# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `KViews.defaultHeaders` (and `apiBaseConfig.defaultHeaders`) for default HTTP headers on every `fetch`.
- Per-instance `headers` and `ajaxOpts` for collections and items; documented merge order in `README.md` and `docs/`.
- `KViews.basePath` documented alongside `KViews.baseUrl` for resolving relative request URLs.

### Fixed

- `createOverlay` returns a valid jQuery chain and uses `document.createElement("div")` for reliable DOM creation.
- `getRenderContext` includes `type` on flattened relationship objects, consistent with docs and tests.
- Test jQuery mock: two-argument `.data(key, value)` chains like jQuery even when `value` is `undefined`.
