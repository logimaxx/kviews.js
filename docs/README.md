# KViews Documentation

Welcome to the KViews documentation! KViews is a class-based JavaScript library for binding API data to DOM elements. It ships with **JSON:API** and **plain REST** adapters; the default wire format is JSON:API. **You must provide [jQuery](https://jquery.com/) and [Handlebars](https://handlebarsjs.com/)** in the page (or from your bundler) before KViews runs; load order should be **jQuery → Handlebars → KViews** (or your app bundle that imports KViews after those peers are configured).

An extended, machine-oriented reference also lives in **[KVIEWS_AI_DOCUMENTATION.md](./KVIEWS_AI_DOCUMENTATION.md)** for tooling and deep dives; everyday use starts with the guides and API pages below.

**Import paths in examples:** Snippets embedded in guides and API pages often use `import … from './src/index.js'` as if you are developing **inside this repository**. When you consume the **`@logimaxx/kviews.js`** package from npm, use `import … from '@logimaxx/kviews.js'` instead (typically resolved via your bundler to `dist/index.js`).

## Documentation Structure

### API Reference
- **[KViews API](./api/KViews.md)** - Main factory class
- **[Item API](./api/Item.md)** - Single resource item class
- **[Collection API](./api/Collection.md)** - Collection of items class
- **[Filtering API](./api/Filtering.md)** - Filter form handling
- **[Paging API](./api/Paging.md)** - Pagination UI class
- **[Utilities API](./api/Utilities.md)** - Utility functions

### User guides and examples
- **[Getting Started](./guides/getting-started.md)** - Installation and basic setup
- **[Installation](./guides/installation.md)** - Detailed installation instructions
- **[Bundle Usage](./guides/bundle-usage.md)** - Using the bundled version
- **[Basic Usage](./guides/basic-usage.md)** - Your first KViews application
- **[Collections Guide](./guides/collections.md)** - Working with collections
- **[Items Guide](./guides/items.md)** - Working with individual items
- **[Adapters Guide](./guides/adapters.md)** - JSON:API vs plain REST and custom wire formats
- **[Templates Guide](./guides/templates.md)** - Using Handlebars templates
- **[Events Guide](./guides/events.md)** - Event handling and callbacks
- **[Advanced Topics](./guides/advanced.md)** - Advanced features and patterns
- **[Examples](./examples/)** - Sample HTML (`test.html`) and JSON:API payload examples

## Quick Start

### Using ES modules (`npm`)

After `npm install @logimaxx/kviews.js handlebars jquery`:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
</head>
<body>
    <div id="collection">
        <div class="item">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
        </div>
    </div>

    <script type="module">
        import KViews from '@logimaxx/kviews.js';
        /* or: import { KViews } from '@logimaxx/kviews.js'; */

        KViews.createCollectionInstance(document.getElementById('collection'), {
            url: '/api/posts',
            type: 'posts'
        });
    </script>
</body>
</html>
```

Use a bundler so the `@logimaxx/kviews.js` import resolves (`dist/index.js` is the package entry).

### Developing KViews locally (this repository)

Clone the repo and import from `./src/index.js` (see [Getting Started](./guides/getting-started.md)).

### Using Bundle (No Module System Required)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script src="./dist/kviews.js"></script>
</head>
<body>
    <div id="collection">
        <div class="item">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
        </div>
    </div>

    <script>
        // KViews is available globally
        KViews.createCollectionInstance(document.getElementById('collection'), {
            url: '/api/posts',
            type: 'posts'
        });
    </script>
</body>
</html>
```

## Features

- ✅ **Class-based architecture** - Modern ES6 classes
- ✅ **Pluggable data adapters** - JSON:API (default) and plain REST; register custom formats
- ✅ **JSON API support** - Full JSON:API hydration, `included`, and compound documents
- ✅ **Plain REST support** - Flat JSON APIs via `adapter: 'plain'`
- ✅ **Template rendering** - Handlebars template support
- ✅ **Event system** - Comprehensive event handling
- ✅ **jQuery required** - DOM and selectors rely on global jQuery (`$`)
- ✅ **Filtering** - Built-in form filtering support
- ✅ **CRUD operations** - Create, Read, Update, Delete support

## Installation Methods

### Bundle (No Module System)

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
<script>
    KViews.createCollectionInstance('#collection', {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

### ES6 Modules (npm + bundler)

```bash
npm install @logimaxx/kviews.js handlebars jquery
```

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script type="module">
    import KViews from '@logimaxx/kviews.js';
    KViews.createCollectionInstance('#collection', {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

Your bundler must resolve `@logimaxx/kviews.js` to `node_modules/@logimaxx/kviews.js/dist/index.js`.

## Requirements

- **jQuery** (required) — load first; KViews expects global `$` / `jQuery`
- **Handlebars** (required) — load second; templates compile with global `Handlebars`
- **Browser** — Modern JavaScript; the IIFE bundle targets the same baseline as the published build. ES module workflows need a bundler and browsers that support ES modules (for example Chrome 61+, Firefox 60+, Safari 11+, Edge 16+).

## Support

- **[SUPPORT.md](../SUPPORT.md)** — issues, docs, and security  
- **[README.md](../README.md)** — project overview and GitHub Pages deploy notes
