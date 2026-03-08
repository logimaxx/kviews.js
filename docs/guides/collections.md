# Collections Guide

Learn how to work with collections of items in KViews.

## What is a Collection?

A Collection represents a list of items fetched from an API endpoint. It manages multiple Item instances and provides methods for loading, rendering, and manipulating them.

## Creating Collections

### Basic Collection

**Using Bundle:**
```html
<script src="./dist/kviews.js"></script>
<script>
    const collection = KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

**Using ES6 Modules:**
```javascript
import { KViews } from './src/index.js';

const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});
```

### Collection Options

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',           // API endpoint
    type: 'posts',                // Resource type
    pageSize: 20,                 // Items per page
    offset: 0,                    // Initial offset
    template: myTemplate,         // Custom template
    emptyview: '#empty-message', // Empty state element
    addontop: true,               // Add new items at top
    disableempty: false,          // Allow empty state
    dontload: false,              // Auto-load on creation
    on: {                         // Event listeners for collection
        load: (collection) => log('Loaded'),
        afterrender: (collection) => log('Rendered')
    },
    itemOn: {                     // Event listeners for all items in collection
        load: (item) => log('Item loaded:', item.id),
        update: (item) => log('Item updated:', item.id),
        remove: (item) => log('Item removed:', item.id)
    }
});
```

## Loading Data

### Auto-load on Creation

By default, collections automatically load data when created:

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});
// Data loads automatically
```

### Manual Loading

```javascript
// Disable auto-load
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    dontload: true
});

// Load manually
collection.loadFromRemote().then((collection) => {
    log('Loaded', collection.items.length, 'items');
});
```

### Loading from Static Data

```javascript
collection.loadFromData([
    {
        id: '1',
        type: 'posts',
        attributes: {
            title: 'Post 1',
            content: 'Content 1'
        }
    },
    {
        id: '2',
        type: 'posts',
        attributes: {
            title: 'Post 2',
            content: 'Content 2'
        }
    }
]);
```

## Accessing Items

### By Index

```javascript
const firstItem = collection.items[0];
const secondItem = collection.items[1];
```

### Using Iterator Methods

```javascript
// Iterate all items
collection.each((item) => {
    log(item.id, item.attributes.title);
});

// Sequential access
collection.rewind();
while (item = collection.next()) {
    log(item);
}

// Previous item
collection.rewind();
collection.next(); // First item
const prev = collection.prev(); // null (before first)
```

### Finding Items

```javascript
// Find by ID
const item = collection.items.find(item => item.id === '123');

// Filter items
const published = collection.items.filter(item => 
    item.attributes.published === true
);
```

## Creating New Items

### Append Item

```javascript
collection.append({
    attributes: {
        title: 'New Post',
        content: 'Post content'
    }
}).then((item) => {
    log('Item created:', item.id);
});
```

### Using Aliases

```javascript
// These are equivalent:
collection.append(data);
collection.newItem(data);
collection.createItem(data);
```

### Adding at Top

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    addontop: true // New items appear at top
});

collection.append({ attributes: { title: 'New' } });
```

## Removing Items

### Remove from Collection

```javascript
// Remove item from collection (doesn't delete from server)
collection.removeItem(item);
collection.render(); // Re-render
```

### Delete from Server

```javascript
item.delete().then(() => {
    // Item is automatically removed from collection
    log('Item deleted');
});
```

## Pagination

Collections support pagination through `offset` and `pageSize` properties. You can also use the `Paging` class to create pagination UI controls.

### Setting Page Size

```javascript
collection.setPageSize(20);
collection.loadFromRemote();
```

### Setting Offset

```javascript
// Page 1
collection.setOffset(0);
collection.loadFromRemote();

// Page 2
collection.setOffset(20);
collection.loadFromRemote();

// Page 3
collection.setOffset(40);
collection.loadFromRemote();
```

### Using the Paging Class

For automatic pagination UI, use the `Paging` class:

```javascript
import { KViews, Paging } from './src/index.js';

// Create collection
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    pageSize: 20
});

// Create paging instance
const paging = new Paging('#paging-container', collection);

// Render pagination after collection loads
collection.on('load', () => {
    paging.render();
});
```

**HTML Structure:**

```html
<div id="paging-container">
    <button name="first">First</button>
    <button name="prev">Previous</button>
    <button name="page">1</button>
    <button name="next">Next</button>
    <button name="last">Last</button>
</div>
```

See [Paging API Reference](../api/Paging.md) for complete documentation.

### URL Parameters

Pagination parameters are automatically added to the URL:

```
/api/posts?page[posts][offset]=0&page[posts][limit]=20
```

## Filtering

### Using Filter Form

```html
<form id="filter-form">
    <input type="text" name="title" placeholder="Title">
    <input type="text" name="author" placeholder="Author">
    <button type="submit">Filter</button>
    <button type="reset">Reset</button>
</form>

<div id="posts"></div>

<script type="module">
    import { KViews } from './src/index.js';
    
    KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts',
        filter: '#filter-form'
    });
</script>
```

### Manual Filtering

```javascript
// Set filter parameters
collection.url.parameters.filter = 'title=My Post,author=John';
collection.setOffset(0); // Reset to first page
collection.loadFromRemote();
```

### Filter Operators

Use `data-operator` attribute on form fields:

```html
<input type="text" name="price" data-operator=">=">
<input type="text" name="title" data-operator="contains">
```

Available operators: `=`, `contains`, `>`, `<`, `>=`, `<=`

## Events

### Collection Events

#### Load Event

```javascript
collection.on('load', (collection) => {
    log('Collection loaded:', collection.items.length, 'items');
    log('Total:', collection.total);
});
```

#### After Render Event

```javascript
collection.on('afterrender', (collection) => {
    log('Collection rendered');
    // Access rendered DOM elements
});
```

#### Update Event

```javascript
collection.on('update', (collection) => {
    log('Collection updated');
    // Triggered when items are added/removed/updated
});
```

### Item Events in Collections

When creating a collection, you can configure event listeners that will be automatically applied to all items created within that collection using the `itemOn` option:

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    itemOn: {
        load: (item) => {
            log('Item loaded:', item.id);
            // This will fire for every item when it's loaded
        },
        update: (item) => {
            log('Item updated:', item.id);
            // Show notification, update UI, etc.
        },
        remove: (item) => {
            log('Item removed:', item.id);
            // Cleanup, update counters, etc.
        },
        afterrender: (item) => {
            log('Item rendered:', item.id);
            // Access rendered DOM, attach custom handlers, etc.
        }
    }
});
```

**Note:** These listeners are applied to **all** items created in the collection, including:
- Items loaded from the API (`loadFromRemote()`)
- Items added via `loadFromData()`
- Items created via `append()` or `createItem()`

**Alternative syntax:** You can also use `itemListeners` instead of `itemOn`:

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    itemListeners: {
        load: (item) => log('Item loaded:', item.id)
    }
});
```

## Empty State

### Default Empty View

```html
<div id="posts">
    <div class="post">
        <h2>{{title}}</h2>
    </div>
</div>
```

When empty, the template is hidden.

### Custom Empty View

```html
<div id="empty-posts" style="display:none;">
    <p>No posts found.</p>
</div>

<div id="posts">
    <div class="post">
        <h2>{{title}}</h2>
    </div>
</div>

<script type="module">
    import { KViews } from './src/index.js';
    
    KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts',
        emptyview: '#empty-posts'
    });
</script>
```

### Disable Empty State

```javascript
KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    disableempty: true // Don't show empty state
});
```

## Rendering

### Manual Render

```javascript
collection.render();
```

### After Data Load

```javascript
collection.loadFromRemote().then(() => {
    // Automatically renders
});
```

### After Update

```javascript
collection.append(data).then(() => {
    // Automatically renders new item
});
```

## Advanced Patterns

### Infinite Scroll

```javascript
let loading = false;

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        if (!loading && collection.offset + collection.pageSize < collection.total) {
            loading = true;
            collection.setOffset(collection.offset + collection.pageSize);
            collection.loadFromRemote().then(() => {
                loading = false;
            });
        }
    }
});
```

### Refresh Collection

```javascript
collection.refresh().then((collection) => {
    log('Collection refreshed');
});
```

### Clear Collection

```javascript
collection.clear(); // Removes all items
collection.render(); // Re-renders empty state
```
