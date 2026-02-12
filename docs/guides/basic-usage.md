# Basic Usage Guide

Learn the fundamentals of using KViews in your applications.

## Usage Methods

KViews can be used in two ways:

1. **Bundle** - Include `dist/kviews.js` (no module system required)
2. **ES6 Modules** - Import from `src/index.js` (requires module support)

Examples in this guide show both methods.

## Creating Collections

### Using Bundle

```html
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
<script>
    const collection = KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

### Using ES6 Modules

```html
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script type="module">
    import { KViews } from './src/index.js';
    
    const collection = KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

### Collection with Options

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    pageSize: 20,
    offset: 0,
    template: myCustomTemplate, // Handlebars template function
    emptyview: '#empty-message',
    addontop: true // Add new items at the top
});
```

### Collection from String URL

```javascript
const collection = KViews.createCollectionInstance('#posts', '/api/posts');
```

## Creating Items

### Using Bundle

```html
<script src="./dist/kviews.js"></script>
<script>
    const item = KViews.createItemInstance('#post-detail', {
        url: '/api/posts/1',
        type: 'posts'
    });
</script>
```

### Using ES6 Modules

```javascript
import { KViews } from './src/index.js';

const item = KViews.createItemInstance('#post-detail', {
    url: '/api/posts/1',
    type: 'posts'
});
```

### Item from String URL

```javascript
// Bundle
const item = KViews.createItemInstance('#post-detail', '/api/posts/1');

// ES6 Modules
import { KViews } from './src/index.js';
const item = KViews.createItemInstance('#post-detail', '/api/posts/1');
```

### Item with Initial Data

```javascript
// Bundle
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

// ES6 Modules
import { KViews } from './src/index.js';
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

## Working with Data

### Loading Data

**Using Bundle:**
```html
<script src="./dist/kviews.js"></script>
<script>
    // Auto-loads on creation
    const collection = KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts'
    });

    // Manual load
    collection.loadFromRemote().then((collection) => {
        console.log('Loaded', collection.items.length, 'items');
    });

    // Load from static data
    collection.loadFromData([
        { id: '1', type: 'posts', attributes: { title: 'Post 1' } },
        { id: '2', type: 'posts', attributes: { title: 'Post 2' } }
    ]);
</script>
```

**Using ES6 Modules:**
```javascript
import { KViews } from './src/index.js';

// Auto-loads on creation
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});

// Manual load
collection.loadFromRemote().then((collection) => {
    console.log('Loaded', collection.items.length, 'items');
});

// Load from static data
collection.loadFromData([
    { id: '1', type: 'posts', attributes: { title: 'Post 1' } },
    { id: '2', type: 'posts', attributes: { title: 'Post 2' } }
]);
```

### Creating Items

```javascript
collection.append({
    attributes: {
        title: 'New Post',
        content: 'Post content'
    }
}).then((item) => {
    console.log('Item created:', item.id);
});
```

### Updating Items

```javascript
item.update({
    title: 'Updated Title'
}).then((item) => {
    console.log('Item updated');
});
```

### Deleting Items

```javascript
item.delete().then(() => {
    console.log('Item deleted');
});
```

## Event Handling

### Collection Events

```javascript
collection.on('load', (collection) => {
    console.log('Collection loaded:', collection.items.length);
});

collection.on('afterrender', (collection) => {
    console.log('Collection rendered');
});

collection.on('update', (collection) => {
    console.log('Collection updated');
});
```

### Item Events

```javascript
item.on('load', (item) => {
    console.log('Item loaded:', item.id);
});

item.on('update', (item) => {
    console.log('Item updated:', item.id);
});

item.on('remove', (item) => {
    console.log('Item removed:', item.id);
});
```

## Templates

### Inline Template

```html
<div id="posts">
    <div class="post">
        <h2>{{title}}</h2>
        <p>{{content}}</p>
        <p>Author: {{author.attributes.name}}</p>
    </div>
</div>
```

### External Template

```html
<template id="post-template">
    <div class="post">
        <h2>{{title}}</h2>
        <p>{{content}}</p>
    </div>
</template>

<div id="posts"></div>

<script type="module">
    import { KViews } from './src/index.js';
    
    KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts',
        template: '#post-template'
    });
</script>
```

### Custom Template Function

```javascript
import Handlebars from 'handlebars';

const template = Handlebars.compile('<div>{{title}}</div>');

KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    template: template
});
```

## Filtering

```html
<form id="filter-form">
    <input type="text" name="title" placeholder="Search title">
    <input type="text" name="author" placeholder="Author">
    <button type="submit">Filter</button>
    <button type="reset">Reset</button>
</form>

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
        filter: '#filter-form'
    });
</script>
```

## Form Integration

Utilities are available via `KViews.helpers` (recommended) or can be imported directly.

### Creating Items from Forms

**Using Bundle:**
```html
<form id="create-form">
    <input type="text" name="title" placeholder="Title">
    <textarea name="content" placeholder="Content"></textarea>
    <button type="submit">Create</button>
</form>

<script src="./dist/kviews.js"></script>
<script>
    const collection = KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts'
    });
    
    // Use KViews.helpers (recommended)
    KViews.helpers.captureFormSubmit('#create-form', (formData) => {
        collection.append({
            attributes: formData
        });
    });
</script>
```

**Using ES6 Modules:**
```html
<form id="create-form">
    <input type="text" name="title" placeholder="Title">
    <textarea name="content" placeholder="Content"></textarea>
    <button type="submit">Create</button>
</form>

<script type="module">
    import { KViews } from './src/index.js';
    
    const collection = KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts'
    });
    
    // Use KViews.helpers (recommended)
    KViews.helpers.captureFormSubmit('#create-form', (formData) => {
        collection.append({
            attributes: formData
        });
    });
    
    // Alternative: Direct import
    // import { utilities } from './src/index.js';
    // utilities.captureFormSubmit('#create-form', ...);
</script>
```

### Editing Items with Forms

**Using Bundle:**
```html
<form id="edit-form">
    <input type="text" name="title">
    <textarea name="content"></textarea>
    <button type="submit">Update</button>
</form>

<script src="./dist/kviews.js"></script>
<script>
    const item = KViews.createItemInstance('#post', '/api/posts/1');
    
    // Fill form when item loads
    item.on('load', (item) => {
        KViews.helpers.fillForm('#edit-form', item);
    });
    
    // Update on submit
    KViews.helpers.captureFormSubmit('#edit-form', (formData) => {
        item.update({
            attributes: formData
        });
    });
</script>
```

**Using ES6 Modules:**
```html
<form id="edit-form">
    <input type="text" name="title">
    <textarea name="content"></textarea>
    <button type="submit">Update</button>
</form>

<script type="module">
    import { KViews } from './src/index.js';
    
    const item = KViews.createItemInstance('#post', '/api/posts/1');
    
    // Fill form when item loads
    item.on('load', (item) => {
        KViews.helpers.fillForm('#edit-form', item);
    });
    
    // Update on submit
    KViews.helpers.captureFormSubmit('#edit-form', (formData) => {
        item.update({
            attributes: formData
        });
    });
</script>
```

## Common Patterns

### Pagination

Collections support pagination through `offset` and `pageSize` properties:

```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    pageSize: 10,
    offset: 0
});

// Next page
collection.setOffset(collection.offset + collection.pageSize);
collection.loadFromRemote();

// Previous page
collection.setOffset(Math.max(0, collection.offset - collection.pageSize));
collection.loadFromRemote();
```

For automatic pagination UI controls, use the `Paging` class:

```javascript
import { Paging } from './src/index.js';

const paging = new Paging('#paging', collection);
collection.on('load', () => paging.render());
```

See [Paging API Reference](../api/Paging.md) for complete documentation.

### Search and Filter

```javascript
// Set filter parameters
collection.url.parameters.filter = 'title=My Post,author=John';
collection.loadFromRemote();
```

### Conditional Rendering

```html
<div id="post">
    {{#if published}}
        <h2>{{title}}</h2>
    {{else}}
        <p>Draft: {{title}}</p>
    {{/if}}
</div>
```

### Iterating Relationships

```html
<div id="post">
    <h2>{{title}}</h2>
    <h3>Tags:</h3>
    <ul>
        {{#each relationships.tags}}
            <li>{{name}}</li>
        {{/each}}
    </ul>
</div>
```
