# KViews

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, class-based JavaScript library for binding JSON API data to DOM elements. KViews provides a clean, declarative way to work with REST APIs and render data using Handlebars templates.

## Features

- ✅ **Class-based architecture** - Modern ES6 classes for better organization
- ✅ **JSON API support** - Full JSON API specification support
- ✅ **Template rendering** - Handlebars template support for flexible rendering
- ✅ **Event system** - Comprehensive event handling for reactivity
- ✅ **jQuery optional** - Works with or without jQuery (falls back to native DOM APIs)
- ✅ **Filtering** - Built-in form filtering support
- ✅ **CRUD operations** - Create, Read, Update, Delete support
- ✅ **Bundle & ES6 modules** - Use as bundle or ES6 modules
- ✅ **TypeScript ready** - Written in modern JavaScript

## Installation

### Using Bundle (No Build Step Required)

Download `dist/kviews.js` and include it in your HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
```

### Using ES6 Modules

```bash
npm install kviews
```

Or copy the `src/` directory to your project.

### Requirements

- **Handlebars** (required) - For template compilation
- **Modern Browser** - ES6 support (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)
- **jQuery** (optional) - Falls back to native DOM APIs if not available

## Quick Start

### Bundle Version

```html
<!DOCTYPE html>
<html>
<head>
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
    console.log('Loaded', collection.items.length, 'items');
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
- `KViews.baseUrl` - Base URL for all API requests
- `KViews.helpers` - Utility functions (fillForm, captureFormSubmit, fetchFormData)

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

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[API Reference](./docs/api/)** - Complete API documentation
- **[User Guides](./docs/guides/)** - Step-by-step guides
- **[Examples](./docs/examples/)** - Code examples

## Development

### Setup

```bash
# Clone repository
git clone <repository-url>
cd kviews.js

# Install dependencies
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
- Uses [Handlebars](https://handlebarsjs.com/) for templating
- Inspired by modern data-binding patterns

---

Made with ❤️ for modern web development
