# KViews Documentation

Welcome to the KViews documentation! KViews is a class-based JavaScript library for binding API data to DOM elements, supporting JSON API format.

## Documentation Structure

### API Reference
- **[KViews API](./api/KViews.md)** - Main factory class
- **[Item API](./api/Item.md)** - Single resource item class
- **[Collection API](./api/Collection.md)** - Collection of items class
- **[Filtering API](./api/Filtering.md)** - Filter form handling
- **[Paging API](./api/Paging.md)** - Pagination UI class
- **[Utilities API](./api/Utilities.md)** - Utility functions

### User Guides
- **[Getting Started](./guides/getting-started.md)** - Installation and basic setup
- **[Installation](./guides/installation.md)** - Detailed installation instructions
- **[Bundle Usage](./guides/bundle-usage.md)** - Using the bundled version
- **[Basic Usage](./guides/basic-usage.md)** - Your first KViews application
- **[Collections Guide](./guides/collections.md)** - Working with collections
- **[Items Guide](./guides/items.md)** - Working with individual items
- **[Templates Guide](./guides/templates.md)** - Using Handlebars templates
- **[Events Guide](./guides/events.md)** - Event handling and callbacks
- **[Advanced Topics](./guides/advanced.md)** - Advanced features and patterns

## Quick Start

### Using ES6 Modules

```html
<!DOCTYPE html>
<html>
<head>
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
        import { KViews } from './src/index.js';
        
        KViews.createCollectionInstance(document.getElementById('collection'), {
            url: '/api/posts',
            type: 'posts'
        });
    </script>
</body>
</html>
```

### Using Bundle (No Module System Required)

```html
<!DOCTYPE html>
<html>
<head>
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
- ✅ **JSON API support** - Full JSON API format support
- ✅ **Template rendering** - Handlebars template support
- ✅ **Event system** - Comprehensive event handling
- ✅ **jQuery optional** - Works with or without jQuery
- ✅ **Filtering** - Built-in form filtering support
- ✅ **CRUD operations** - Create, Read, Update, Delete support

## Installation Methods

### Bundle (No Module System)

```html
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
<script>
    KViews.createCollectionInstance('#collection', {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

### ES6 Modules

```html
<script type="module">
    import { KViews } from './src/index.js';
    KViews.createCollectionInstance('#collection', {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

## Requirements

- **Handlebars** - Required for template compilation
- **jQuery** - Optional (falls back to native DOM APIs)
- **Browser** - Modern browser (bundle works everywhere, ES6 modules require Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)

## Support

For issues, questions, or contributions, please refer to the project repository.
