# KViews API Reference

The main factory class for creating Item and Collection instances.

KViews expects **jQuery** (`$`) and **Handlebars** globally in the browser. Load jQuery, then Handlebars, then the bundle.

## Usage

### Bundle Version

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
<script>
    // KViews is available globally
    const collection = KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

### ES6 Modules

Ensure **jQuery** and **Handlebars** are loaded in the page (or provided by your bundler) before this module runs.

```javascript
import { KViews } from './src/index.js';

const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});
```

## Class: KViews

Main factory class for creating Item and Collection instances.

### Static Properties

#### `KViews.baseUrl`
Prefix prepended to **relative** request URLs in `Storage` (any string: origin, origin + path, or path prefix). Absolute `http(s)://` (and `//`) URLs are not modified. If both `baseUrl` and `basePath` are set, `baseUrl` wins.

```javascript
KViews.baseUrl = 'https://api.example.com';
```

#### `KViews.basePath`
Same behavior as `baseUrl` for resolving relative URLs, intended for path-only prefixes (for example `/api/v1`). Used only when `baseUrl` is null or unset.

```javascript
KViews.basePath = '/api/v1';
```

#### `KViews.defaultHeaders`
Plain object of HTTP headers merged into **every** `fetch` performed by KViews `Storage`. Lowest precedence: per-instance `headers` / `Storage` defaults, then headers passed into a specific `Storage.sync` call, override the same keys.

```javascript
KViews.defaultHeaders = { Authorization: 'Bearer ' + token };

// Replace the whole defaults object; assign null/undefined to clear to {}
KViews.defaultHeaders = { Accept: 'application/vnd.api+json' };
```

You may also mutate the returned object: `KViews.defaultHeaders['X-Trace'] = id`.

#### `KViews.defaultAdapter`
Global default data adapter when none is set on a collection or item. Default: `'jsonapi'`. Accepts a built-in name (`'jsonapi'`, `'plain'`) or an adapter instance.

```javascript
KViews.defaultAdapter = 'plain';
```

See [Adapters Guide](../guides/adapters.md).

#### `KViews.registerAdapter(name, adapter)`
Register a custom adapter by name for use with `adapter: 'my-name'`.

```javascript
KViews.registerAdapter('my-api', myAdapter);
```

#### `KViews.helpers`
Utility functions for form handling and other operations. See [Utilities API](./Utilities.md) for details.

```javascript
// Access utilities via KViews.helpers
KViews.helpers.fillForm('#edit-form', item);
KViews.helpers.captureFormSubmit('#create-form', (formData) => {
    collection.append({ attributes: formData });
});
```

**Available helpers:**
- `fillForm(form, item)` - Fill form with item data
- `captureFormSubmit(form, callback)` - Capture form submission
- `fetchFormData(form)` - Extract form data as object

### Static Methods

#### `KViews.createCollectionInstance(el, opts)`

Creates a new Collection instance bound to a DOM element.

**Parameters:**
- `el` (HTMLElement|jQuery) - DOM element to bind the collection to. Used as template in case **opts.template** is not provided.
- `opts` (Object|String) - Configuration options or URL string

**Options:**
- `url` (String) - API endpoint URL
- `type` (String) - Resource type name
- `adapter` (String|Object) - `'jsonapi'` (default), `'plain'`, registered name, or adapter instance
- `template` (Function|String|jQuery) - Handlebars template function, selector, or jQuery object
- `pageSize` (Number) - Number of items per page (default: 10)
- `offset` (Number) - Initial offset for pagination
- `emptyview` (HTMLElement|String) - Element or selector for empty state
- `filter` (HTMLElement|String) - Form element or selector for filtering
- `container` (HTMLElement|String) - Container element for items
- `disableempty` (Boolean) - Disable empty state rendering
- `addontop` (Boolean) - Add new items at the top
- `headers` (Object) - HTTP headers merged into all requests for this instance (overrides `KViews.defaultHeaders` on duplicate keys)
- `ajaxOpts` (Object) - Options passed to the internal `Storage` constructor (e.g. `headers`); merged with top-level `headers`
- `storage` (Storage) - Custom `Storage` instance (if set, `headers` / `ajaxOpts` are not applied automatically—configure that instance yourself)
- `actions` (Array) - Array of action objects for items
- `on` (Object) - Event listeners object
- `dontload` (Boolean) - Don't auto-load data

**Returns:** Collection instance or DOM element

**Example:**
```javascript
const collection = KViews.createCollectionInstance(document.getElementById('posts'), {
    url: '/api/posts',
    type: 'posts',
    pageSize: 20
});
```

#### `KViews.createItemInstance(el, opts, data)`

Creates a new Item instance bound to a DOM element.

**Parameters:**
- `el` (HTMLElement|jQuery) - DOM element to bind the item to
- `opts` (Object|String) - Configuration options or URL string
- `data` (Object) - Optional initial data to load

**Options:**
- `url` (String) - API endpoint URL
- `type` (String) - Resource type name
- `adapter` (String|Object) - Data adapter (default: `'jsonapi'` or collection adapter)
- `template` (Function|String|jQuery) - Handlebars template function, selector, or jQuery object
- `emptyview` (HTMLElement|String) - Element or selector for empty state
- `strict` (Boolean) - Strict mode (reject unknown attributes)
- `headers` (Object) - HTTP headers for all requests for this item (merged with `KViews.defaultHeaders`; instance wins on duplicate keys)
- `ajaxOpts` (Object) - Passed to internal `Storage` unless `storage` is provided
- `storage` (Storage) - Custom `Storage` instance
- `actions` (Array) - Array of action objects
- `on` (Object) - Event listeners object
- `dontload` (Boolean) - Don't auto-load data

**Returns:** Item instance or DOM element

**Example:**
```javascript
const item = KViews.createItemInstance(document.getElementById('post'), {
    url: '/api/posts/1',
    type: 'posts'
});
```

### Helper Methods (Internal)

#### `KViews.prepareOptions(el, opts)`

Extracts and merges options from element data attributes and parameters.

#### `KViews.getOrUpdateInstance(el, options)`

Checks for existing instance and updates it if found. A whitelisted set of options is applied safely; this includes `headers`, which updates the instance’s `Storage` default headers (useful after refreshing a token).

#### `KViews.processEmptyView(options)`

Processes the emptyview option.

#### `KViews.finalizeInstance(el, instance, options, listeners)`

Attaches listeners, stores instance on element, and triggers auto-load.

## jQuery Plugin

When jQuery is available, KViews registers a jQuery plugin:

```javascript
// Collection
$('#collection').kviews({
    url: '/api/posts',
    type: 'posts'
});

// Item
$('#item').kviews({
    url: '/api/posts/1',
    resourcetype: 'item'
});

// Helper methods
$('#collection').kviewsCollection('/api/posts');
$('#item').kviewsItem('/api/posts/1');

// Same static HTTP settings as KViews (baseUrl, basePath, defaultHeaders)
$.fn.kviews.defaultHeaders = { Authorization: 'Bearer ' + token };
```

## Global Access

KViews is available globally when loaded:

```javascript
window.KViews.createCollectionInstance(...);
```
