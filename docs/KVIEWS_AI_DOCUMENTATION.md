# KViews - AI Development Guide

**Purpose:** Complete reference documentation for AI-assisted development with KViews  
**Target:** AI systems helping developers build business applications  
**Version:** 2.0.0

---

## Quick Reference

### Core Concepts

- **Collection**: Manages a list of items from JSON:API endpoint
- **Item**: Represents a single resource from JSON:API endpoint
- **View**: Handles DOM rendering (CollectionView for lists, ItemView for details)
- **Template**: Handlebars template for data formatting
- **Storage**: HTTP operations layer (Fetch API)

### Dependencies

- **jQuery** (required) - DOM manipulation
- **Handlebars** (required) - Template compilation
- **ES6+ Browser** - Modern JavaScript support

---

## API Quick Reference

### KViews Factory

```javascript
// Create collection
const collection = KViews.createCollectionInstance(selector, {
    url: '/api/resource',
    type: 'resource-type',
    pageSize: 20,
    filter: '#filter-form',
    paging: '#pagination'
});

// Create item
const item = KViews.createItemInstance(selector, {
    url: '/api/resource/123',
    type: 'resource-type'
});

// Base URL / path — relative `url` values are prefixed (absolute http(s) URLs unchanged)
KViews.baseUrl = 'https://api.example.com';
// KViews.basePath = '/api/v1'; // optional path-only prefix if baseUrl unset

// Default HTTP headers for every request (Fetch); per-instance `headers` overrides same keys
KViews.defaultHeaders = { Authorization: 'Bearer ' + token };

// Helpers
KViews.helpers.fillForm('#form', item);
KViews.helpers.captureFormSubmit('#form', callback);
KViews.helpers.fetchFormData('#form');
```

### Collection API

```javascript
// Loading
collection.loadFromRemote() → Promise<Collection>
collection.loadFromData(array) → Collection

// CRUD
collection.insert(itemData) → Promise<Item>        // Single item
collection.batchInsert(itemsArray) → Promise<Array<Item>>  // Multiple items
collection.removeItem(item) → Promise

// Rendering
collection.render() → Collection
collection.clear() → Collection

// Events
collection.on(event, callback) → Collection
collection.off(event, callback?) → Collection
collection.once(event, callback) → Collection
collection.emit(event, ...args) → Collection
collection.hasListeners(event) → Boolean

// Properties
collection.items → Array<Item>
collection.length → Number (getter)
collection.url → URL
collection.type → String
collection.view → CollectionView
collection.paging → Paging|null
collection.filtering → Filtering|null
```

### Item API

```javascript
// Loading
item.loadFromRemote() → Promise<Item>
item.loadFromData(data) → Item

// CRUD
item.update(data, opts) → Promise<Item>
item.delete(opts) → Promise<Item>

// Rendering
item.render() → Item

// Events
item.on(event, callback) → Item
item.off(event, callback?) → Item
item.once(event, callback) → Item
item.emit(event, ...args) → Item
item.hasListeners(event) → Boolean

// Properties
item.id → String|null
item.type → String
item.attributes → Object
item.relationships → Object
item.views → Array<ItemView>
item.collection → Collection|null
```

---

## Common Patterns

### Pattern 1: Basic List View

**Use Case:** Display a list of records with pagination

```javascript
// HTML
<div id="users-list">
    <div class="user-item">
        <h3>{{name}}</h3>
        <p>{{email}}</p>
    </div>
</div>
<div id="pagination"></div>

// JavaScript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users',
    paging: '#pagination',
    pageSize: 20
});

collection.loadFromRemote();
```

### Pattern 2: List with Filtering

**Use Case:** Searchable/filterable list

```javascript
// HTML
<form id="user-filter">
    <input type="text" name="name" placeholder="Name">
    <input type="email" name="email" placeholder="Email">
    <button type="submit">Filter</button>
</form>
<div id="users-list"><!-- template --></div>

// JavaScript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users',
    filter: '#user-filter',  // Enables automatic filtering
    pageSize: 20
});
```

### Pattern 3: Create New Record

**Use Case:** Form to create new record

```javascript
// HTML
<form id="create-user-form">
    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <button type="submit">Create</button>
</form>

// JavaScript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users'
});

// Option 1: Using helper
KViews.helpers.captureFormSubmit('#create-user-form', (formData) => {
    collection.insert({
        attributes: formData
    }).then((newItem) => {
        console.log('Created:', newItem.id);
        $('#create-user-form')[0].reset();
    });
});

// Option 2: Manual
$('#create-user-form').on('submit', (e) => {
    e.preventDefault();
    const formData = KViews.helpers.fetchFormData('#create-user-form');
    collection.insert({ attributes: formData });
});
```

### Pattern 4: Edit Record

**Use Case:** Edit existing record

```javascript
// HTML
<div id="users-list"><!-- template with edit buttons --></div>
<form id="edit-user-form" style="display:none;">
    <input type="hidden" name="id">
    <input type="text" name="name">
    <input type="email" name="email">
    <button type="submit">Save</button>
</form>

// JavaScript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users'
});

// Open edit form
$('#users-list').on('click', '.edit-btn', function() {
    const itemId = $(this).data('id');
    const item = collection.items.find(i => i.id === itemId);
    
    if (item) {
        KViews.helpers.fillForm('#edit-user-form', item);
        $('#edit-user-form').show();
    }
});

// Save changes
$('#edit-user-form').on('submit', (e) => {
    e.preventDefault();
    const formData = KViews.helpers.fetchFormData('#edit-user-form');
    const item = collection.items.find(i => i.id === formData.id);
    
    if (item) {
        item.update({
            attributes: formData
        }).then(() => {
            $('#edit-user-form').hide();
        });
    }
});
```

### Pattern 5: Delete Record

**Use Case:** Delete record with confirmation

```javascript
// HTML
<div id="users-list">
    <div class="user-item">
        <h3>{{name}}</h3>
        <button class="delete-btn" data-id="{{id}}">Delete</button>
    </div>
</div>

// JavaScript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users'
});

$('#users-list').on('click', '.delete-btn', function() {
    const itemId = $(this).data('id');
    const item = collection.items.find(i => i.id === itemId);
    
    if (item && confirm('Delete this item?')) {
        item.delete().then(() => {
            console.log('Item deleted');
        }).catch((error) => {
            alert('Failed to delete: ' + error.message);
        });
    }
});
```

### Pattern 6: Detail View

**Use Case:** Show single record details

```javascript
// HTML
<div id="user-detail">
    <h2>{{name}}</h2>
    <p>Email: {{email}}</p>
    <p>Role: {{role}}</p>
</div>

// JavaScript
const item = KViews.createItemInstance('#user-detail', {
    url: '/api/users/123',
    type: 'users'
});

item.loadFromRemote();
```

### Pattern 7: Relationships in Templates

**Use Case:** Display related data

```javascript
// Template for post with author
<div class="post">
    <h2>{{title}}</h2>
    <p>{{content}}</p>
    <p>Author: {{author.name}} ({{author.email}})</p>
    <div class="tags">
        {{#each tags}}
            <span>{{name}}</span>
        {{/each}}
    </div>
</div>

// KViews automatically hydrates relationships
// Access directly: {{author.name}}, not {{relationships.author.attributes.name}}
```

### Pattern 8: Event-Driven Updates

**Use Case:** Update UI when data changes

```javascript
const collection = KViews.createCollectionInstance('#orders-list', {
    url: '/api/orders',
    type: 'orders'
});

// Update stats when collection loads
collection.on('load', (collection) => {
    $('#total-orders').text(collection.items.length);
});

// Refresh after item operations
collection.on('update', () => {
    collection.loadFromRemote();
});

// Item-specific listeners
collection.on('afterrender', () => {
    collection.items.forEach(item => {
        item.on('update', () => {
            console.log('Item updated:', item.id);
            // Update specific UI element
        });
    });
});
```

### Pattern 9: Batch Operations

**Use Case:** Create multiple records at once

```javascript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users'
});

// Create multiple users
collection.batchInsert([
    { attributes: { name: 'User 1', email: 'user1@example.com' } },
    { attributes: { name: 'User 2', email: 'user2@example.com' } },
    { attributes: { name: 'User 3', email: 'user3@example.com' } }
]).then((newItems) => {
    console.log('Created', newItems.length, 'users');
});
```

### Pattern 10: Loading States

**Use Case:** Show loading indicator

```javascript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users'
});

collection.on('beforeload', () => {
    $('#loading').show();
});

collection.on('load', () => {
    $('#loading').hide();
});

collection.on('update', () => {
    $('#loading').hide();
});
```

### Pattern 11: Error Handling

**Use Case:** Handle API errors gracefully

```javascript
collection.insert({ attributes: {...} })
    .then((item) => {
        console.log('Success:', item);
    })
    .catch((error) => {
        if (error instanceof KViewsHttpError) {
            if (error.status === 422) {
                // Validation errors
                const errors = error.responseJSON?.errors || {};
                displayValidationErrors(errors);
            } else if (error.status === 404) {
                alert('Resource not found');
            } else {
                alert('Server error: ' + error.status);
            }
        } else {
            alert('Network error');
        }
    });
```

### Pattern 12: Custom Actions on Items

**Use Case:** Item-specific actions (approve, reject, etc.)

```javascript
const collection = KViews.createCollectionInstance('#orders-list', {
    url: '/api/orders',
    type: 'orders'
});

collection.on('afterrender', () => {
    $('#orders-list').on('click', '.approve-btn', function() {
        const itemId = $(this).data('id');
        const item = collection.items.find(i => i.id === itemId);
        
        if (item) {
            item.update({
                attributes: { status: 'approved' }
            }).then(() => {
                console.log('Order approved');
            });
        }
    });
});
```

### Pattern 13: Scroll Pagination

**Use Case:** Infinite scroll instead of page navigation

```javascript
const collection = KViews.createCollectionInstance('#posts-list', {
    url: '/api/posts',
    type: 'posts',
    navtype: 'scroll',  // Use scroll instead of page
    pageSize: 20
});

// Auto-load more on scroll
$(window).on('scroll', () => {
    if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
        collection.offset += collection.pageSize;
        collection.loadFromRemote();
    }
});
```

### Pattern 14: Item Listeners in Collection

**Use Case:** Apply listeners to all items in collection

```javascript
const collection = KViews.createCollectionInstance('#users-list', {
    url: '/api/users',
    type: 'users',
    itemListeners: {
        'load': (item) => {
            console.log('Item loaded:', item.id);
        },
        'update': (item) => {
            console.log('Item updated:', item.id);
            // Update UI for this specific item
        }
    }
});
```

### Pattern 15: Conditional Rendering

**Use Case:** Show different content based on data

```javascript
// Template
<div class="order">
    <h3>Order #{{id}}</h3>
    {{#if status}}
        <span class="status-{{status}}">{{status}}</span>
    {{/if}}
    {{#if customer}}
        <p>Customer: {{customer.name}}</p>
    {{else}}
        <p>No customer assigned</p>
    {{/if}}
</div>
```

---

## API Details

### Collection Options

```javascript
{
    url: String,                    // API endpoint URL (required)
    type: String,                   // Resource type (required)
    template: Function|String,      // Handlebars template (optional)
    pageSize: Number,                // Items per page (default: 10)
    offset: Number,                 // Initial offset (default: 0)
    navtype: 'page'|'scroll',       // Navigation type (default: 'page')
    emptyview: String|Element,      // Empty state element
    filter: String|Element,         // Filter form element
    paging: String|Element,         // Pagination container
    addontop: Boolean,              // Add new items at top (default: false)
    itemListeners: Object,          // Listeners for all items
    itemOn: Object,                 // Alias for itemListeners
    on: Object,                     // Collection event listeners
    dontload: Boolean               // Don't auto-load (default: false)
}
```

### Item Options

```javascript
{
    url: String,                    // API endpoint URL (required)
    type: String,                   // Resource type (required)
    template: Function|String,      // Handlebars template (optional)
    emptyview: String|Element,      // Empty state element
    strict: Boolean,                // Strict mode (default: false)
    on: Object,                     // Item event listeners
    dontload: Boolean               // Don't auto-load (default: false)
}
```

### Event Names

**Collection Events:**
- `beforeload` - Before loading from API
- `load` - After loading from API
- `update` - When collection updates
- `afterrender` - After rendering

**Item Events:**
- `beforeload` - Before loading from API
- `load` - After loading from API
- `update` - When item updates
- `remove` - When item is removed
- `afterrender` - After rendering

---

## Template Syntax

### Direct Attribute Access

```handlebars
<!-- ✅ Correct -->
<h2>{{title}}</h2>
<p>{{content}}</p>

<!-- ❌ Wrong -->
<h2>{{attributes.title}}</h2>
```

### Relationships

```handlebars
<!-- To-one relationship -->
<p>Author: {{author.name}}</p>
<p>Category: {{category.name}}</p>

<!-- To-many relationship -->
{{#each tags}}
    <span>{{name}}</span>
{{/each}}

<!-- Null check -->
{{#if author}}
    <p>{{author.name}}</p>
{{else}}
    <p>No author</p>
{{/if}}
```

### Handlebars built-ins (and custom helpers)

KViews does **not** register extra Handlebars helpers. You get standard Handlebars block helpers such as:

```handlebars
{{#if condition}}...{{/if}}
{{#unless condition}}...{{/unless}}
{{#each items}}...{{/each}}
```

For comparisons (`eq`, `gt`, etc.), register your own helpers (for example with `Handlebars.registerHelper`) or use a helper library your app already loads.

---

## Data Format

### JSON:API Input Format

KViews expects JSON:API format:

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
          "id": "10",
          "type": "users"
        }
      },
      "tags": {
        "data": [
          { "id": "1", "type": "tags" },
          { "id": "2", "type": "tags" }
        ]
      }
    }
  },
  "included": [
    {
      "id": "10",
      "type": "users",
      "attributes": {
        "name": "John Doe"
      }
    }
  ]
}
```

### Runtime Data Format

After parsing, relationships are hydrated:

```javascript
// Runtime format (what you work with in code)
{
    id: '1',
    type: 'posts',
    attributes: { title: 'Post Title' },
    relationships: {
        author: {
            id: '10',
            type: 'users',
            attributes: { name: 'John Doe' }
        },
        tags: [
            { id: '1', type: 'tags', attributes: { name: 'tech' } }
        ]
    }
}
```

---

## Common Mistakes & Solutions

### Mistake 1: Using append() for single item

```javascript
// ❌ Wrong - append() is deprecated and bivalent
collection.append({ attributes: {...} });

// ✅ Correct - use insert() for single item
collection.insert({ attributes: {...} });

// ✅ Correct - use batchInsert() for multiple items
collection.batchInsert([{ attributes: {...} }]);
```

### Mistake 2: Accessing attributes incorrectly in templates

```handlebars
<!-- ❌ Wrong -->
<h2>{{attributes.title}}</h2>

<!-- ✅ Correct -->
<h2>{{title}}</h2>
```

### Mistake 3: Not handling async operations

```javascript
// ❌ Wrong - doesn't wait for completion
collection.insert({ attributes: {...} });
console.log('Done'); // Runs before insert completes

// ✅ Correct - handle promise
collection.insert({ attributes: {...} })
    .then((item) => {
        console.log('Done:', item);
    });
```

### Mistake 4: Mutating relationships directly

```javascript
// ❌ Wrong - don't mutate relationships directly
item.relationships.author = newAuthor;

// ✅ Correct - use update()
item.update({
    author: newAuthorData
});
```

### Mistake 5: Not cleaning up listeners

```javascript
// ❌ Wrong - memory leak
collection.on('load', () => { ... });
// Listener never removed

// ✅ Correct - remove when done
const handler = () => { ... };
collection.on('load', handler);
// Later...
collection.off('load', handler);
```

### Mistake 6: Using clear() when expecting async cleanup

```javascript
// ❌ Wrong - clear() is synchronous, doesn't call item.remove()
collection.clear(); // Items not properly cleaned up

// ✅ Correct - use destroy() for full cleanup
collection.destroy();
```

---

## Best Practices

### 1. Always handle errors

```javascript
collection.insert({ attributes: {...} })
    .catch((error) => {
        console.error('Error:', error);
        // Show user-friendly message
    });
```

### 2. Use events for decoupling

```javascript
// ✅ Good - decoupled
collection.on('load', updateStats);
collection.on('load', refreshUI);

// ❌ Bad - coupled
collection.on('load', () => {
    updateStats();
    refreshUI();
    // ... many responsibilities
});
```

### 3. Clean up resources

```javascript
// When component/page is destroyed
collection.destroy();
item.destroy();
```

### 4. Use itemListeners for item-level events

```javascript
// ✅ Good - listeners applied to all items
const collection = KViews.createCollectionInstance('#users', {
    url: '/api/users',
    type: 'users',
    itemListeners: {
        'update': (item) => { ... }
    }
});

// ❌ Bad - manual setup for each item
collection.on('load', () => {
    collection.items.forEach(item => {
        item.on('update', () => { ... });
    });
});
```

### 5. Validate data before operations

```javascript
// Before insert
const formData = KViews.helpers.fetchFormData('#form');
if (!formData.name || !formData.email) {
    alert('Please fill all fields');
    return;
}
collection.insert({ attributes: formData });
```

---

## Code Generation Examples

### Generate: List View with CRUD

```javascript
// AI should generate:
function createUsersList(containerSelector) {
    const collection = KViews.createCollectionInstance(containerSelector, {
        url: '/api/users',
        type: 'users',
        pageSize: 20,
        paging: '#pagination',
        filter: '#filter-form'
    });
    
    // Setup create
    KViews.helpers.captureFormSubmit('#create-form', (formData) => {
        collection.insert({ attributes: formData });
    });
    
    // Setup edit
    $(containerSelector).on('click', '.edit-btn', function() {
        const itemId = $(this).data('id');
        const item = collection.items.find(i => i.id === itemId);
        if (item) {
            KViews.helpers.fillForm('#edit-form', item);
            $('#edit-modal').show();
        }
    });
    
    // Setup delete
    $(containerSelector).on('click', '.delete-btn', function() {
        const itemId = $(this).data('id');
        const item = collection.items.find(i => i.id === itemId);
        if (item && confirm('Delete?')) {
            item.delete();
        }
    });
    
    return collection;
}
```

### Generate: Detail View with Edit

```javascript
// AI should generate:
function createUserDetail(containerSelector, userId) {
    const item = KViews.createItemInstance(containerSelector, {
        url: `/api/users/${userId}`,
        type: 'users'
    });
    
    item.loadFromRemote().then(() => {
        KViews.helpers.fillForm('#edit-form', item);
    });
    
    $('#edit-form').on('submit', (e) => {
        e.preventDefault();
        const formData = KViews.helpers.fetchFormData('#edit-form');
        item.update({ attributes: formData });
    });
    
    return item;
}
```

---

## Anti-Patterns to Avoid

### ❌ Don't: Mix KViews with React/Vue state

```javascript
// ❌ Wrong - mixing frameworks
const [items, setItems] = useState([]);
collection.on('load', (collection) => {
    setItems(collection.items); // Don't do this
});
```

### ❌ Don't: Create complex state management

```javascript
// ❌ Wrong - KViews manages its own state
let globalState = {};
collection.on('load', (collection) => {
    globalState.items = collection.items; // Unnecessary
});
```

### ❌ Don't: Fight KViews opinions

```javascript
// ❌ Wrong - trying to change KViews behavior
collection.items = []; // Don't mutate directly
collection.length = 0; // length is a getter

// ✅ Correct - use KViews methods
collection.clear();
```

### ❌ Don't: Use for complex UI

```javascript
// ❌ Wrong - KViews is for simple CRUD
// Don't use for complex dashboards, real-time updates, etc.
```

---

## Quick Decision Tree

**Should I use KViews?**

1. **Is it a business/internal application?** → ✅ Yes, continue
2. **Is it a CRUD interface?** → ✅ Yes, continue
3. **Do you need complex state management?** → ❌ No, use KViews
4. **Do you need real-time updates?** → ❌ No, use KViews
5. **Is it a public-facing app with complex UX?** → ❌ No, don't use KViews

**Which method to use?**

- **Single item creation:** `collection.insert()`
- **Multiple items creation:** `collection.batchInsert()`
- **Update item:** `item.update()`
- **Delete item:** `item.delete()`
- **Load collection:** `collection.loadFromRemote()`
- **Load item:** `item.loadFromRemote()`

---

## Error Reference

### KViewsHttpError

```javascript
try {
    await collection.insert({ attributes: {...} });
} catch (error) {
    if (error instanceof KViewsHttpError) {
        console.log(error.status);        // HTTP status code
        console.log(error.statusText);    // HTTP status text
        console.log(error.responseText);  // Response body as text
        console.log(error.responseJSON);  // Parsed JSON response
        console.log(error.message);       // Error message
    }
}
```

### KViewsNetworkError

```javascript
try {
    await collection.loadFromRemote();
} catch (error) {
    if (error instanceof KViewsNetworkError) {
        console.log('Network error:', error.message);
        console.log('Original error:', error.originalError);
    }
}
```

### KViewsParseError

```javascript
try {
    collection.loadFromData(invalidData);
} catch (error) {
    if (error instanceof KViewsParseError) {
        console.log('Parse error:', error.message);
    }
}
```

---

## Complete Example: User Management

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script src="./dist/kviews.js"></script>
</head>
<body>
    <!-- Filter Form -->
    <form id="user-filter">
        <input type="text" name="name" placeholder="Name">
        <input type="email" name="email" placeholder="Email">
        <button type="submit">Filter</button>
    </form>

    <!-- Create Form -->
    <form id="create-user-form">
        <input type="text" name="name" placeholder="Name" required>
        <input type="email" name="email" placeholder="Email" required>
        <button type="submit">Create User</button>
    </form>

    <!-- Users List -->
    <div id="users-list">
        <div class="user-item">
            <h3>{{name}}</h3>
            <p>{{email}}</p>
            <button class="edit-btn" data-id="{{id}}">Edit</button>
            <button class="delete-btn" data-id="{{id}}">Delete</button>
        </div>
    </div>

    <!-- Pagination -->
    <div id="pagination"></div>

    <!-- Edit Modal -->
    <div id="edit-modal" style="display:none;">
        <form id="edit-user-form">
            <input type="hidden" name="id">
            <input type="text" name="name" required>
            <input type="email" name="email" required>
            <button type="submit">Save</button>
            <button type="button" class="cancel-btn">Cancel</button>
        </form>
    </div>

    <script>
        // Create collection
        const collection = KViews.createCollectionInstance('#users-list', {
            url: '/api/users',
            type: 'users',
            pageSize: 20,
            filter: '#user-filter',
            paging: '#pagination'
        });

        // Create user
        KViews.helpers.captureFormSubmit('#create-user-form', (formData) => {
            collection.insert({ attributes: formData })
                .then(() => {
                    $('#create-user-form')[0].reset();
                })
                .catch((error) => {
                    alert('Failed to create user: ' + error.message);
                });
        });

        // Edit user
        $('#users-list').on('click', '.edit-btn', function() {
            const itemId = $(this).data('id');
            const item = collection.items.find(i => i.id === itemId);
            if (item) {
                KViews.helpers.fillForm('#edit-user-form', item);
                $('#edit-modal').show();
            }
        });

        // Save edit
        $('#edit-user-form').on('submit', (e) => {
            e.preventDefault();
            const formData = KViews.helpers.fetchFormData('#edit-user-form');
            const item = collection.items.find(i => i.id === formData.id);
            if (item) {
                item.update({ attributes: formData })
                    .then(() => {
                        $('#edit-modal').hide();
                    })
                    .catch((error) => {
                        alert('Failed to update: ' + error.message);
                    });
            }
        });

        // Cancel edit
        $('.cancel-btn').on('click', () => {
            $('#edit-modal').hide();
        });

        // Delete user
        $('#users-list').on('click', '.delete-btn', function() {
            const itemId = $(this).data('id');
            const item = collection.items.find(i => i.id === itemId);
            if (item && confirm('Delete this user?')) {
                item.delete()
                    .catch((error) => {
                        alert('Failed to delete: ' + error.message);
                    });
            }
        });

        // Load initial data
        collection.loadFromRemote();
    </script>
</body>
</html>
```

---

## Summary for AI

**KViews is:**
- A lightweight library for CRUD interfaces
- Opinionated - follow its patterns
- For business/internal applications
- jQuery + Handlebars based

**Key principles:**
1. Use `insert()` for single items, `batchInsert()` for multiple
2. Access attributes directly in templates: `{{title}}` not `{{attributes.title}}`
3. Relationships are hydrated automatically
4. Use events for decoupling
5. Always handle promises (async operations)
6. Clean up with `destroy()` when done

**Common operations:**
- List: `createCollectionInstance()` + `loadFromRemote()`
- Create: `collection.insert()`
- Update: `item.update()`
- Delete: `item.delete()`
- Filter: Add `filter` option
- Paginate: Add `paging` option

**Template rules:**
- Attributes: `{{attributeName}}`
- Relationships: `{{relationshipName.attributeName}}`
- Arrays: `{{#each relationshipName}}{{attributeName}}{{/each}}`

---

**End of AI Documentation**
