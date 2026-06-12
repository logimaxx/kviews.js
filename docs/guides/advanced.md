# Advanced Topics

Advanced patterns and techniques for using KViews.

## Custom Storage

Create a custom Storage instance with specific options:

```javascript
import { Storage, KViews } from './src/index.js';

const customStorage = new Storage({
    url: 'https://api.example.com',
    method: 'GET',
    headers: { Authorization: 'Bearer ...' }
});

const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    storage: customStorage
});
```

## Base URL configuration

Set a prefix for **relative** request URLs (see also `KViews.basePath` for path-only prefixes):

```javascript
KViews.baseUrl = 'https://api.example.com';

// Relative URLs are resolved against baseUrl
KViews.createCollectionInstance('#posts', {
    url: '/api/posts', // Becomes 'https://api.example.com/api/posts'
    type: 'posts'
});
```

## Default HTTP headers (global)

Use `KViews.defaultHeaders` for headers that should be sent on **every** request (for example a bearer token or API key). Values are merged with per-instance options; the same header name on an instance overrides the global default.

```javascript
KViews.defaultHeaders = {
    Authorization: 'Bearer ' + accessToken,
    Accept: 'application/vnd.api+json'
};

// Optional: per-instance headers (merged; override duplicate keys)
KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    headers: { 'X-Request-Id': requestId }
});
```

Merge order when building a request: **global `defaultHeaders` → `Storage` defaults** (from `new Storage(ajaxOpts)` and instance `headers`) **→ headers passed to a specific `Storage.sync` call**. Later steps win on duplicate keys.

To clear globals: `KViews.defaultHeaders = null` (or assign a new object).

## Per-instance headers and `ajaxOpts`

Collections and items accept a `headers` object in their options. You can also pass `ajaxOpts`, which is forwarded to the `Storage` constructor; if both define `headers`, they are shallow-merged with top-level `headers` winning on conflicts.

If you pass a custom `storage` instance, KViews does not merge `headers` / `ajaxOpts` for you—put defaults on that `Storage` yourself.

## Custom URL Handling

### Manipulating URLs

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});

// Modify URL parameters
collection.url.parameters.sort = '-created_at';
collection.url.parameters.filter = 'published=true';

// Reload with new parameters
collection.loadFromRemote();
```

### Dynamic URL Building

```javascript
function buildPostUrl(postId) {
    return `/api/posts/${postId}`;
}

const item = KViews.createItemInstance('#post', {
    url: buildPostUrl(1),
    type: 'posts'
});
```

## Actions on Items

Define actions that can be triggered from templates:

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    actions: [
        {
            selector: '.edit-btn',
            event: 'click',
            action: (item, view) => {
                openEditModal(item);
            }
        },
        {
            selector: '.delete-btn',
            event: 'click',
            action: (item, view) => {
                if (confirm('Delete this item?')) {
                    item.delete();
                }
            }
        }
    ]
});
```

**Template:**
```html
<div class="post">
    <h2>{{title}}</h2>
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
</div>
```

## Custom Templates

### Dynamic Template Selection

```javascript
function getTemplate(item) {
    if (item.attributes.published) {
        return publishedTemplate;
    } else {
        return draftTemplate;
    }
}

// Note: This requires custom implementation
// Templates are typically set at collection/item creation
```

### Template Caching

```javascript
const templateCache = {};

function getCachedTemplate(id) {
    if (!templateCache[id]) {
        const source = document.getElementById(id).innerHTML;
        templateCache[id] = Handlebars.compile(source);
    }
    return templateCache[id];
}
```

## Error Handling

### Global Error Handler

```javascript
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.options) {
        console.error('KViews error:', event.reason);
        showError('An error occurred');
    }
});
```

### Collection Error Handling

```javascript
collection.loadFromRemote()
    .then((collection) => {
        log('Success');
    })
    .catch((error) => {
        console.error('Error:', error);
        if (error.jqXHR && error.jqXHR.status === 404) {
            showEmptyState();
        } else {
            showError('Failed to load data');
        }
    });
```

### Item Error Handling

```javascript
item.loadFromRemote()
    .then((item) => {
        log('Item loaded');
    })
    .catch((error) => {
        console.error('Error:', error);
        item.views.forEach(view => view.renderEmpty());
    });
```

## Performance Optimization

### Lazy Loading

```javascript
// Don't auto-load
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    dontload: true
});

// Load when needed
function loadWhenVisible() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            collection.loadFromRemote();
            observer.disconnect();
        }
    });
    
    observer.observe(document.getElementById('posts'));
}

loadWhenVisible();
```

### Debounced Filtering

```javascript
let filterTimeout;

document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(filterTimeout);
    
    filterTimeout = setTimeout(() => {
        collection.url.parameters.filter = `title=${e.target.value}`;
        collection.setOffset(0);
        collection.loadFromRemote();
    }, 300);
});
```

### Silent background refresh

For items that poll the server or reload on a timer, disable the built-in overlay and rely on conditional re-rendering (views update only when data actually changed):

```javascript
const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',
    type: 'posts',
    showLoader: false,
});

setInterval(() => {
    item.loadFromRemote(); // no overlay; no DOM update if payload unchanged
}, 30000);
```

### Virtual Scrolling

For large collections, consider implementing virtual scrolling:

```javascript
// Only render visible items
function renderVisibleItems(collection) {
    const container = collection.view.el;
    const scrollTop = container.scrollTop;
    const itemHeight = 100;
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = visibleStart + Math.ceil(container.clientHeight / itemHeight);
    
    // Render only visible items
    collection.items.slice(visibleStart, visibleEnd).forEach(item => {
        item.render(collection.view);
    });
}
```

## Integration Patterns

### React Integration

```javascript
import { useEffect, useRef } from 'react';
import { KViews } from './src/index.js';

function PostList() {
    const containerRef = useRef(null);
    const collectionRef = useRef(null);
    
    useEffect(() => {
        if (containerRef.current && !collectionRef.current) {
            collectionRef.current = KViews.createCollectionInstance(
                containerRef.current,
                {
                    url: '/api/posts',
                    type: 'posts'
                }
            );
            
            collectionRef.current.on('load', (collection) => {
                // Trigger React re-render if needed
            });
        }
        
        return () => {
            // Cleanup if needed
        };
    }, []);
    
    return <div ref={containerRef}></div>;
}
```

### Vue Integration

```javascript
import { onMounted, ref } from 'vue';
import { KViews } from './src/index.js';

export default {
    setup() {
        const container = ref(null);
        const collection = ref(null);
        
        onMounted(() => {
            collection.value = KViews.createCollectionInstance(
                container.value,
                {
                    url: '/api/posts',
                    type: 'posts'
                }
            );
        });
        
        return { container };
    }
};
```

## Testing

### Mock Storage

```javascript
class MockStorage extends Storage {
    read(ctx, url, opts) {
        return Promise.resolve({
            data: {
                data: [
                    {
                        id: '1',
                        type: 'posts',
                        attributes: {
                            title: 'Test Post',
                            content: 'Test Content'
                        }
                    }
                ]
            },
            textStatus: 'success',
            jqXHR: null
        });
    }
}

const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    storage: new MockStorage()
});
```

## Debugging

### Enable Debug Logging

```javascript
window.kviewsLogLevel = 3; // Maximum logging
```

### Inspect Instances

```javascript
// Collection
log(collection.items);
log(collection.url);
log(collection.view);

// Item
log(item.attributes);
log(item.relationships);
log(item.views);
```

### Check Event Listeners

```javascript
collection.showlisteners(); // Shows all registered listeners
```

## Best Practices

1. **Always handle errors** - Use `.catch()` on promises
2. **Register events early** - Before loading data
3. **Use templates** - Keep logic out of templates
4. **Optimize rendering** - Only render when necessary
5. **Clean up** - Remove event listeners when done
6. **Use TypeScript** - For better type safety (if using TypeScript)
