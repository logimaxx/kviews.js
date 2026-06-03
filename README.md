# KViews

[![npm version](https://img.shields.io/npm/v/@logimaxx/kviews.js.svg)](https://www.npmjs.com/package/@logimaxx/kviews.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, class-based JavaScript library for binding API data to DOM elements. KViews provides a clean, declarative way to work with REST APIs (JSON:API by default, plain REST via adapters) and render data using Handlebars templates. **Runtime requirements:** [jQuery](https://jquery.com/) (DOM and selectors) and [Handlebars](https://handlebarsjs.com/) (templates); both are `peerDependencies` when you install from npm.

## Features

- ✅ **Class-based architecture** - Modern ES6 classes for better organization
- ✅ **JSON API support** - Full JSON API specification support (default adapter)
- ✅ **Plain REST adapter** - Flat JSON APIs via `adapter: 'plain'`
- ✅ **Template rendering** - Handlebars template support for flexible rendering
- ✅ **Event system** - Comprehensive event handling for reactivity
- ✅ **jQuery required** - Uses jQuery exclusively for DOM manipulation
- ✅ **Filtering** - Built-in form filtering support
- ✅ **CRUD operations** - Create, Read, Update, Delete support
- ✅ **Bundle & ES6 modules** - Use as bundle or ES6 modules
- ✅ **TypeScript ready** - Written in modern JavaScript

## Installation

### npm

```bash
npm install @logimaxx/kviews.js
```

ES module import (browser app with your bundler):

```javascript
import KViews from '@logimaxx/kviews.js';
// or: import { KViews, Collection, Item, Storage } from '@logimaxx/kviews.js';
```

Peer dependencies: **Handlebars** and **jQuery** must be installed in your app (`npm install handlebars jquery`).

The **npm tarball** ships **`dist/`** only: `dist/index.js` is the ES module entry (`"main"` / `"exports"`), and `dist/kviews.js` / `dist/kviews.min.js` are IIFE bundles for `<script>` tags. The `src/` tree lives in the git repository for development. `npm publish` runs `prepack`, which runs `npm run build`, so published `dist/` always matches the release.

### Using Bundle (No Build Step Required)

Download `dist/kviews.js` and include it in your HTML:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
```

### Using ES6 modules

```bash
npm install @logimaxx/kviews.js
```

Use `import` from the `kviews` package (see **Quick Start** below). To hack on the library itself, clone this repo and import from `src/index.js`.

### Requirements

Load **jQuery** before **Handlebars**, then KViews (bundle or your module entry), so globals `$` / `jQuery` and `Handlebars` exist when KViews runs.

- **jQuery** (required) — DOM manipulation and selectors throughout the library (`peerDependency`, typically ^3)
- **Handlebars** (required) — Template compilation (`peerDependency`, typically ^4)
- **Modern browser** — ES6 support (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)

## Quick Start

### Bundle Version

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script src="./dist/kviews.js"></script>
</head>
<body>
    <div id="posts">
        <div class="post">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
        </div>
    </div>

    <script>
        KViews.createCollectionInstance('#posts', {
            url: '/api/posts',
            type: 'posts'
        });
    </script>
</body>
</html>
```

### ES6 Modules

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
</head>
<body>
    <div id="posts">
        <div class="post">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
        </div>
    </div>

    <script type="module">
        // With a bundler (Vite, webpack, etc.) after `npm install @logimaxx/kviews.js`:
        import KViews from '@logimaxx/kviews.js';

        KViews.createCollectionInstance('#posts', {
            url: '/api/posts',
            type: 'posts'
        });
    </script>
</body>
</html>
```

## Usage Examples

### Collections

```javascript
// Create a collection
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    pageSize: 20
});

// Listen to events
collection.on('load', (collection) => {
    log('Loaded', collection.items.length, 'items');
});

// Add new item
collection.append({
    attributes: {
        title: 'New Post',
        content: 'Post content'
    }
});
```

### Items

```javascript
// Create an item
const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',
    type: 'posts'
});

// Update item
item.update({
    attributes: {
        title: 'Updated Title'
    }
});

// Delete item
item.delete();
```

### Form Integration

```javascript
// Fill form with item data
KViews.helpers.fillForm('#edit-form', item);

// Capture form submission
KViews.helpers.captureFormSubmit('#create-form', (formData) => {
    collection.append({ attributes: formData });
});
```

### Filtering

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    filter: '#filter-form'  // Form element for filtering
});
```

## API Overview

### KViews (Factory Class)

- `KViews.createCollectionInstance(el, opts)` - Create collection instance
- `KViews.createItemInstance(el, opts, data)` - Create item instance
- `KViews.baseUrl` - Prefix for relative request URLs (full origin or any path prefix)
- `KViews.basePath` - Same role as `baseUrl` when you only need a path prefix; ignored if `baseUrl` is set
- `KViews.defaultHeaders` - Default HTTP headers merged into every request (e.g. global auth); per-instance `headers` override on duplicate keys
- `KViews.helpers` - Utility functions (fillForm, captureFormSubmit, fetchFormData)

### HTTP: URLs and headers

Relative `url` values are resolved with `KViews.baseUrl` or `KViews.basePath` before `fetch`. Absolute `http(s)://` URLs are left unchanged.

Default headers apply app-wide; each collection or item can add or override headers via the `headers` option (and optional `ajaxOpts` for lower-level `Storage` defaults). Merge order is: **global `defaultHeaders` → instance / `Storage` defaults → per-request overrides** (later wins on the same header name).

```javascript
KViews.defaultHeaders = { Authorization: 'Bearer ' + token };

KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    headers: { 'X-Request-Id': crypto.randomUUID() }
});
```

With jQuery, `$.fn.kviews.baseUrl`, `basePath`, and `defaultHeaders` mirror the `KViews` static properties.

### Collection

- `loadFromRemote()` - Load data from API
- `append(itemData)` - Add new item
- `render()` - Render collection
- `on(event, callback)` - Event listeners
- `items` - Array of Item instances

### Item

- `loadFromRemote()` - Load item from API
- `update(data)` - Update item
- `delete()` - Delete item
- `render()` - Render item
- `on(event, callback)` - Event listeners

## Contributing, support, and security

We welcome issues and pull requests.

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — setup, tests, build, PR expectations  
- **[SUPPORT.md](./SUPPORT.md)** — where to ask questions and report bugs  
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** — community guidelines  
- **[SECURITY.md](./SECURITY.md)** — **private** vulnerability reporting  
- **[CHANGELOG.md](./CHANGELOG.md)** — release notes  
- **[RELEASE_FLOW.md](./RELEASE_FLOW.md)** — checklist for maintainers cutting a release  

## GitHub Pages

This repo includes a static site in [`website/`](./website/) (landing page, **live collection demo** that loads [`website/data/posts.json`](./website/data/posts.json), and a minimal bundle check page). The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs tests, builds `dist/`, copies `kviews.js` / `kviews.min.js` into `website/dist/`, and deploys to **GitHub Pages**.

**One-time setup in the GitHub repo**

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main` or `master` (or run the **Deploy GitHub Pages** workflow manually from the Actions tab).

The site will be available at **`https://logimaxx.github.io/kviews/`** (replace `logimaxx` with your user or org name if different). The first deploy may ask you to approve the **github-pages** environment.

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[API Reference](./docs/api/)** — class and method reference  
- **[User guides](./docs/guides/)** — step-by-step tutorials ([adapters](./docs/guides/adapters.md) for JSON:API vs plain REST)
- **[Examples](./docs/examples/)** — sample HTML and JSON:API payloads

## Development

### Setup

```bash
git clone https://github.com/logimaxx/kviews.git
cd kviews

npm install
```

### Build

```bash
# Build bundle (normal + minified)
npm run build
```

This creates:
- `dist/kviews.js` - Normal bundle with sourcemap
- `dist/kviews.min.js` - Minified bundle

### Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

### Development Server

```bash
# Python
npm run serve:python

# PHP
npm run serve:php

# Node.js
npm run serve:node
```

## Project Structure

```
kviews.js/
├── src/                  # Source code
│   ├── KViews.js        # Main factory class
│   ├── Item.js          # Item class
│   ├── Collection.js     # Collection class
│   ├── Storage.js        # HTTP operations
│   ├── URL.js            # URL parsing
│   ├── utilities.js      # Utility functions
│   └── ...
├── dist/                 # Built bundles
├── docs/                 # Documentation
│   ├── api/             # API reference
│   ├── guides/          # User guides
│   └── examples/        # Code examples
├── tests/                # Test suite
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
└── build.js             # Build script
```

## Browser support

- **ES modules** (`import … from '@logimaxx/kviews.js'` via a bundler): evergreen browsers aligned with baseline ES modules (approx. Chrome 61+, Firefox 60+, Safari 11+, Edge 16+).

- **IIFE bundle** (`dist/kviews.js`): same modern JavaScript assumptions as the build (see `build.js`). Very old browsers (for example IE 11) are **not** a supported target unless you fork and downgrade the toolchain; use an evergreen browser or upgrade client environments.

## JSON API Format

KViews expects data in JSON API format:

```json
{
  "data": {
    "id": "1",
    "type": "posts",
    "attributes": {
      "title": "Post Title",
      "content": "Post content"
    },
    "relationships": {
      "author": {
        "data": {
          "id": "123",
          "type": "users"
        }
      }
    }
  }
}
```

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE).

## Changelog

Version history and migration notes live in **[CHANGELOG.md](./CHANGELOG.md)**.

## Support

See **[SUPPORT.md](./SUPPORT.md)** for documentation links, GitHub issues, and security reporting.

## Acknowledgments

- Built with modern JavaScript (ES6+)
- Uses [jQuery](https://jquery.com/) for DOM APIs and [Handlebars](https://handlebarsjs.com/) for templating
- Inspired by modern data-binding patterns

---

Created to tame complexity: code cleaner, work less.
