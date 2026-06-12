# Items Guide

Learn how to work with individual items in KViews.

**Runtime:** KViews requires **jQuery** and **Handlebars** (see [Getting Started](./getting-started.md)). Bundle examples below load jQuery, then Handlebars, then `./dist/kviews.js`.

## What is an Item?

An Item represents a single resource fetched from an API endpoint. It manages the item's data, relationships, and views.

## Creating Items

### Basic Item

**Using Bundle:**
```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
<script>
    const item = KViews.createItemInstance('#post-detail', {
        url: '/api/posts/1',
        type: 'posts'
    });
</script>
```

**Using ES6 Modules:**
```javascript
import { KViews } from './src/index.js';

const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',
    type: 'posts'
});
```

### Item Options

```javascript
const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',      // API endpoint
    type: 'posts',             // Resource type
    template: myTemplate,      // Custom template
    emptyview: '#empty',      // Empty state element
    strict: false,             // Strict mode
    dontload: false,          // Auto-load on creation
    showLoader: true,         // Loading overlay during loadFromRemote() (default: true)
    on: {                      // Event listeners
        load: (item) => log('Loaded'),
        update: (item) => log('Updated')
    }
});
```

### Item from String URL

```javascript
const item = KViews.createItemInstance('#post-detail', '/api/posts/1');
```

### Item with Initial Data

```javascript
const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',
    type: 'posts'
}, {
    id: '1',
    type: 'posts',
    attributes: {
        title: 'My Post',
        content: 'Post content'
    }
});
```

## Loading Data

### Auto-load on Creation

```javascript
const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',
    type: 'posts'
});
// Data loads automatically
```

### Manual Loading

```javascript
const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',
    type: 'posts',
    dontload: true
});

item.loadFromRemote().then((item) => {
    log('Item loaded:', item.attributes.title);
});
```

### Reloading and background refresh

Calling `loadFromRemote()` again on an already loaded item compares the response to the current data. Views are **re-rendered only when something changed** (`id`, `type`, `attributes`, or `relationships`). The `load` event still fires when the request completes.

By default, a loading overlay is shown over bound views while the request is in flight. Disable it for polling or silent updates:

```javascript
const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',
    type: 'posts',
    showLoader: false,
});

// Or on an existing instance before reload
item.showLoader = false;
item.loadFromRemote();
```

Use `beforeload` / `load` if you want your own loading indicator instead of the built-in overlay.

### Loading from Static Data

```javascript
item.loadFromData({
    id: '1',
    type: 'posts',
    attributes: {
        title: 'My Post',
        content: 'Post content'
    }
});
```

### Loading from a remote API document

Use `loadFromRemoteDoc()` after fetch, or let `loadFromRemote()` call it for you. The active **adapter** (JSON:API by default) controls parsing:

```javascript
// JSON:API (default adapter)
item.loadFromRemoteDoc({
    data: {
        id: '1',
        type: 'posts',
        attributes: {
            title: 'My Post'
        },
        relationships: {
            author: {
                data: { id: '123', type: 'users' }
            }
        }
    },
    included: [
        {
            id: '123',
            type: 'users',
            attributes: {
                name: 'John Doe'
            }
        }
    ]
});

// Plain REST (adapter: 'plain')
item.loadFromRemoteDoc({ id: 1, title: 'My Post', author: { id: 123, name: 'John Doe' } });
```

`loadFromJSONAPIDoc()` is a deprecated alias for `loadFromRemoteDoc()`. See [Adapters guide](./adapters.md).

## Accessing Data

### Attributes

```javascript
const title = item.attributes.title;
const content = item.attributes.content;

// Update attribute
item.attributes.title = 'New Title';
```

### Relationships

```javascript
// 1:1 relationship
const author = item.relationships.author;
log(author.attributes.name);

// 1:N relationship
const tags = item.relationships.tags;
tags.forEach(tag => {
    log(tag.attributes.name);
});
```

### Item Properties

```javascript
const id = item.id;
const type = item.type;
const url = item.url.toString();
```

## Updating Items

### Basic Update

```javascript
item.update({
    title: 'Updated Title',
    content: 'Updated content'
}).then((item) => {
    log('Item updated');
});
```

### Update Options

```javascript
item.update({
    attributes: {
        title: 'New Title'
    }
}, {
    sync: true,      // Sync immediately (default: true)
    rerender: true   // Re-render views (default: true)
});
```

### Updating Relationships

```javascript
// Update 1:1 relationship
item.update({
    relationships: {
        author: {
            data: { id: '456', type: 'users' }
        }
    }
});

// Clear relationship
item.update({
    relationships: {
        author: null
    }
});
```

### Deferred Update

```javascript
// Make changes without syncing
item.update({
    attributes: { title: 'New Title' }
}, { sync: false });

// Sync later
item.sync().then(() => {
    log('Synced');
});
```

## Deleting Items

### Delete from Server

```javascript
item.delete().then(() => {
    log('Item deleted from server');
    // Item is automatically removed from views and collection
});
```

### Delete Options

```javascript
item.delete({
    sync: true // Sync immediately (default: true)
});
```

### Remove from Views Only

```javascript
item.remove().then(() => {
    log('Item removed from views');
    // Item still exists on server
});
```

## Setting URLs

### Set Main URL

```javascript
item.setUrl('/api/posts/1');
```

### Set Update URL

```javascript
item.setUrl('/api/posts/1', 'update');
// or
item.updateUrl = createURL('/api/posts/1');
```

### Set Delete URL

```javascript
item.setUrl('/api/posts/1', 'delete');
// or
item.deleteUrl = createURL('/api/posts/1');
```

## Multiple Views

### Binding Multiple Views

```javascript
const item = KViews.createItemInstance('#post-detail', '/api/posts/1');

// Bind additional view
item.bindView(new ItemView({
    template: summaryTemplate,
    el: '#post-summary'
}));

// All views update when item changes
item.update({ attributes: { title: 'New' } });
// Both #post-detail and #post-summary update
```

### Unbinding Views

```javascript
item.unbindView(view);
```

## Events

### Load Event

```javascript
item.on('load', (item) => {
    log('Item loaded:', item.id);
    log('Title:', item.attributes.title);
});
```

### Update Event

```javascript
item.on('update', (item) => {
    log('Item updated:', item.id);
});
```

### Remove Event

```javascript
item.on('remove', (item) => {
    log('Item removed:', item.id);
});
```

## Rendering

### Manual Render

```javascript
item.render();
```

### Render to Specific View

```javascript
const collectionView = collection.view;
item.render(collectionView);
```

### Render with Options

```javascript
item.render(collectionView, true); // addontop = true
```

## Relationships

### Accessing Relationships

```javascript
// 1:1 relationship
const author = item.relationships.author;
if (author) {
    log(author.attributes.name);
}

// 1:N relationship
const comments = item.relationships.comments;
if (comments && comments.length) {
    comments.forEach(comment => {
        log(comment.attributes.text);
    });
}
```

### Updating Relationships

```javascript
// Set relationship
item.update({
    relationships: {
        author: {
            data: { id: '123', type: 'users' }
        }
    }
});

// Clear relationship
item.update({
    relationships: {
        author: null
    }
});
```

## JSON API Format

### Converting to JSON

```javascript
const json = item.toJSON();
// {
//     type: 'posts',
//     id: '1',
//     attributes: { ... },
//     relationships: { ... }
// }
```

### Loading from a remote document

Prefer `loadFromRemoteDoc()` (works with any adapter). Example with default JSON:API:

```javascript
item.loadFromRemoteDoc({
    data: {
        id: '1',
        type: 'posts',
        attributes: {
            title: 'My Post'
        },
        relationships: {
            author: {
                data: { id: '123', type: 'users' }
            }
        }
    },
    included: [
        {
            id: '123',
            type: 'users',
            attributes: {
                name: 'John Doe'
            }
        }
    ]
});
```

For non–JSON:API backends, set `adapter: 'plain'` on the item or collection. See [Adapters guide](./adapters.md).

## Common Patterns

### Form Integration

**Using KViews.helpers (Recommended):**
```javascript
// Bundle or ES6 Modules
const item = KViews.createItemInstance('#post', '/api/posts/1');

// Fill form with item data
item.on('load', (item) => {
    KViews.helpers.fillForm('#edit-form', item);
});

// Update on form submit
KViews.helpers.captureFormSubmit('#edit-form', (formData) => {
    item.update({
        attributes: formData
    });
});
```

**Alternative: Direct Import:**
```javascript
import { utilities } from './src/index.js';

// Fill form with item data
item.on('load', (item) => {
    utilities.fillForm('#edit-form', item);
});

// Update on form submit
utilities.captureFormSubmit('#edit-form', (formData) => {
    item.update({
        attributes: formData
    });
});
```

### Conditional Actions

```javascript
if (item.attributes.published) {
    // Show edit button
} else {
    // Show publish button
}
```

### Refresh Item

```javascript
item.refresh().then((item) => {
    log('Item refreshed');
});
```
