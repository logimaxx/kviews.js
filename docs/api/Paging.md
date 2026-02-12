# Paging API Reference

Handles pagination UI for collections.

## Class: Paging

**Note:** Paging functionality is available but not automatically enabled. You can create a Paging instance manually if needed.

### Constructor

```javascript
new Paging(pagingEl, collection)
```

**Parameters:**
- `pagingEl` (HTMLElement|jQuery|String) - Container element for pagination controls
- `collection` (Collection) - Collection instance to paginate

### Properties

#### `collection` (Collection)
The collection instance this paging is bound to.

#### `el` (HTMLElement|jQuery)
The pagination container element.

#### `pageSize` (Number)
Current page size.

#### `iniOffset` (Number)
Initial offset value.

#### `defaultPageSize` (Number)
Default page size (20).

#### `buttons` (Object)
Button templates extracted from the container:
- `page` - Page number button template
- `prev` - Previous button template
- `next` - Next button template
- `first` - First page button template
- `last` - Last page button template

### Methods

#### `render()`

Render pagination controls based on collection state.

**Returns:** void

**Example:**
```javascript
import { Paging } from './src/index.js';

const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});

const paging = new Paging('#paging-container', collection);
paging.render();
```

### HTML Structure

The paging container should include button templates:

```html
<div id="paging-container">
    <button name="first">First</button>
    <button name="prev">Previous</button>
    <button name="page">1</button>
    <button name="next">Next</button>
    <button name="last">Last</button>
</div>
```

### Collection Properties Used

Paging reads these properties from the collection:

- `collection.offset` - Current offset
- `collection.pageSize` - Items per page
- `collection.total` - Total number of items
- `collection.items` - Current items array
- `collection.pagesizeinp` - Page size input selector/element
- `collection.offsetinp` - Offset input selector/element
- `collection.totalrecscount` - Total count display selector/element

### Usage Example

```javascript
// Create collection
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    pageSize: 20
});

// Create paging instance
const paging = new Paging('#paging', collection);

// Render pagination after collection loads
collection.on('load', () => {
    paging.render();
});
```
