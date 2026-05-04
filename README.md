# KViews

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, class-based JavaScript library for binding JSON API data to DOM elements. KViews provides a clean, declarative way to work with REST APIs and render data using Handlebars templates. **Runtime requirements:** [jQuery](https://jquery.com/) (DOM and selectors) and [Handlebars](https://handlebarsjs.com/) (templates); both are `peerDependencies` when you install from npm.

## Features

- ✅ **Class-based architecture** - Modern ES6 classes for better organization
- ✅ **JSON API support** - Full JSON API specification support
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
npm install kviews
```

ES module import (browser app with your bundler):

```javascript
import KViews from 'kviews';
// named exports: Item, Collection, Storage, …
```

Peer dependencies: **Handlebars** and **jQuery** must be installed in your app (`npm install handlebars jquery`).

The published package includes `src/` (ESM) and `dist/` (IIFE bundle). Run `npm run build` before `npm pack` / `npm publish`; `prepack` runs the build automatically.

### Using Bundle (No Build Step Required)

Download `dist/kviews.js` and include it in your HTML:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
```

### Using ES6 Modules

```bash
npm install kviews
```

Or copy the `src/` directory to your project.

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
        import { KViews } from './src/index.js';
        
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

## Contributing & security

- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to run tests and submit changes  
- [SECURITY.md](./SECURITY.md) — how to report security issues  
- [CHANGELOG.md](./CHANGELOG.md) — release notes  

## GitHub Pages

This repo includes a static site in [`website/`](./website/) (landing page, **live collection demo** that loads [`website/data/posts.json`](./website/data/posts.json), and a minimal bundle check page). The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs tests, builds `dist/`, copies `kviews.js` / `kviews.min.js` into `website/dist/`, and deploys to **GitHub Pages**.

**One-time setup in the GitHub repo**

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main` or `master` (or run the **Deploy GitHub Pages** workflow manually from the Actions tab).

The site will be available at **`https://logimaxx.github.io/kviews/`** (replace `logimaxx` with your user or org name if different). The first deploy may ask you to approve the **github-pages** environment.

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[API Reference](./docs/api/)** - Complete API documentation
- **[User Guides](./docs/guides/)** - Step-by-step guides
- **[Examples](./docs/examples/)** - Code examples

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

## Browser Support

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+
- IE11+ (with polyfills for bundle version)

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### Version 2.0.0 (Breaking Changes)

**Event System Refactoring:**
- ✅ **Unified event system** - Removed dual callback system (`onafterrender`, `onbeforeload` properties)
- ✅ **New event methods** - Added `off()`, `once()`, `emit()`, `hasListeners()` methods
- ✅ **Standardized events** - All events now use `on()` method exclusively
- ✅ **New Item events** - Added `beforeload`, `load`, `afterrender` events (previously missing or inconsistent)
- ✅ **Collection events** - Added `beforeload` event
- ✅ **Return value consistency** - `Collection.onupdate()` now returns `this` for chaining

**Breaking Changes:**
- ❌ **Removed:** `collection.onafterrender` and `collection.onbeforeload` properties
- ❌ **Removed:** `item.onafterrender` property
- ✅ **Migration:** Use `collection.on('afterrender', callback)` instead of `collection.onafterrender = callback`
- ✅ **Migration:** Use `collection.on('beforeload', callback)` instead of `collection.onbeforeload = callback`

**Improvements:**
- Event listeners can now be removed with `off()`
- One-time listeners supported with `once()`
- Manual event triggering with `emit()`
- Consistent event API across Collection and Item classes

### Version 1.0.3

- Fixed bundle to properly expose `KViews.createCollectionInstance` and `KViews.createItemInstance`
- Refactored Paging to ES6 class
- Templates now expose attributes directly (use `{{title}}` instead of `{{attributes.title}}`)
- Utilities exposed via `KViews.helpers` (recommended access method)
- Removed `getUtilities()` instance methods
- Storage class now uses Fetch API exclusively (no jQuery dependency)
- Added comprehensive test suite (Vitest + Playwright)
- Improved build script to generate both normal and minified bundles

### Version 1.0.0

- Initial release
- Class-based architecture
- JSON API support
- Handlebars templating
- Event system
- Form utilities
- Bundle and ES6 module support

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Check the [documentation](./docs/)
- Review [examples](./docs/examples/)

## Acknowledgments

- Built with modern JavaScript (ES6+)
- Uses [jQuery](https://jquery.com/) for DOM APIs and [Handlebars](https://handlebarsjs.com/) for templating
- Inspired by modern data-binding patterns

---

Created to tame complexity: code cleaner, work less.
