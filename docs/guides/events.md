# Events Guide

Learn how to handle events in KViews.

## Event System Overview

KViews provides an event system for both Collections and Items, allowing you to react to data changes, rendering, and user interactions.

## Collection Events

### Load Event

Fired when collection data is loaded from the server.

```javascript
collection.on('load', (collection) => {
    console.log('Collection loaded:', collection.items.length, 'items');
    console.log('Total items:', collection.total);
});
```

### After Render Event

Fired after the collection view is rendered.

```javascript
collection.on('afterrender', (collection) => {
    console.log('Collection rendered');
    // Access rendered DOM elements
    collection.view.el.querySelectorAll('.post').forEach(post => {
        console.log('Rendered post:', post);
    });
});
```

### Update Event

Fired when the collection is updated (items added, removed, or modified).

```javascript
collection.on('update', (collection) => {
    console.log('Collection updated');
    // Refresh UI, update counters, etc.
});
```

## Item Events

### Load Event

Fired when item data is loaded from the server.

```javascript
item.on('load', (item) => {
    console.log('Item loaded:', item.id);
    console.log('Title:', item.attributes.title);
});
```

### Update Event

Fired when item is updated.

```javascript
item.on('update', (item) => {
    console.log('Item updated:', item.id);
    // Update UI, show notification, etc.
});
```

### Remove Event

Fired when item is removed.

```javascript
item.on('remove', (item) => {
    console.log('Item removed:', item.id);
    // Cleanup, update counters, etc.
});
```

## Event Registration

### Single Event Listener

```javascript
collection.on('load', (collection) => {
    console.log('Loaded');
});
```

### Multiple Listeners

```javascript
collection.on('load', (collection) => {
    console.log('Listener 1');
});

collection.on('load', (collection) => {
    console.log('Listener 2');
});

// Both listeners fire when 'load' event occurs
```

### Multiple Events

```javascript
collection.on('load', (collection) => {
    console.log('Loaded');
});

collection.on('afterrender', (collection) => {
    console.log('Rendered');
});

collection.on('update', (collection) => {
    console.log('Updated');
});
```

## Event Registration at Creation

### Using `on` Option

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    on: {
        load: (collection) => {
            console.log('Collection loaded');
        },
        afterrender: (collection) => {
            console.log('Collection rendered');
        },
        update: (collection) => {
            console.log('Collection updated');
        }
    }
});
```

### Item Events at Creation

```javascript
const item = KViews.createItemInstance('#post', {
    url: '/api/posts/1',
    type: 'posts',
    on: {
        load: (item) => {
            console.log('Item loaded');
        },
        update: (item) => {
            console.log('Item updated');
        },
        remove: (item) => {
            console.log('Item removed');
        }
    }
});
```

## Common Event Patterns

### Loading Indicator

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});

collection.on('load', (collection) => {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('posts').style.display = 'block';
});
```

### Update Counter

```javascript
collection.on('load', (collection) => {
    document.getElementById('count').textContent = collection.items.length;
});

collection.on('update', (collection) => {
    document.getElementById('count').textContent = collection.items.length;
});
```

### Form Integration

```javascript
const item = KViews.createItemInstance('#post', '/api/posts/1');

item.on('load', (item) => {
    // Fill form when item loads
    KViews.helpers.fillForm('#edit-form', item);
});

item.on('update', (item) => {
    // Show success message
    showNotification('Item updated successfully');
});
```

### Notification System

```javascript
collection.on('load', (collection) => {
    showNotification(`Loaded ${collection.items.length} items`);
});

item.on('update', (item) => {
    showNotification('Item updated');
});

item.on('remove', (item) => {
    showNotification('Item deleted');
});
```

### Analytics Tracking

```javascript
collection.on('load', (collection) => {
    trackEvent('collection_loaded', {
        type: collection.type,
        count: collection.items.length
    });
});

item.on('update', (item) => {
    trackEvent('item_updated', {
        type: item.type,
        id: item.id
    });
});
```

## View Events

### ItemView After Render

```javascript
const view = item.views[0];

view.on('afterrender', (view) => {
    console.log('View rendered');
    // Access rendered element
    const el = view.el;
    // Add animations, bind additional events, etc.
});
```

## Event Chaining

Events can be chained:

```javascript
collection
    .on('load', (collection) => console.log('Loaded'))
    .on('afterrender', (collection) => console.log('Rendered'))
    .on('update', (collection) => console.log('Updated'));
```

## Debugging Events

Enable debug logging to see all events:

```javascript
window.kviewsLogLevel = 3;

// Events will be logged to console
```

## Best Practices

### 1. Register Events Early

```javascript
// Good - register before loading
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    dontload: true
});

collection.on('load', (collection) => {
    console.log('Loaded');
});

collection.loadFromRemote();
```

### 2. Clean Up Event Listeners

```javascript
// Store reference for cleanup
const loadHandler = (collection) => {
    console.log('Loaded');
};

collection.on('load', loadHandler);

// Later, remove listener (if needed)
// Note: KViews doesn't provide off() method currently
```

### 3. Use Event Data

```javascript
collection.on('load', (collection) => {
    // Use collection data
    updateUI(collection.items);
    updatePagination(collection.total, collection.pageSize);
});
```

### 4. Handle Errors

```javascript
collection.loadFromRemote()
    .then((collection) => {
        console.log('Loaded successfully');
    })
    .catch((error) => {
        console.error('Load failed:', error);
        showError('Failed to load data');
    });
```
