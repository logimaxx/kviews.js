# Collection API Reference

Represents a collection of items from an API.

## Class: Collection

### Constructor

```javascript
new Collection(options)
```

When using the constructor directly (instead of `KViews.createCollectionInstance`), common HTTP-related options include:

- `headers` (Object) - Default headers for this collection’s `Storage` (merged with `KViews.defaultHeaders` on each request)
- `ajaxOpts` (Object) - Constructor options for the internal `Storage` (merged with `headers`)
- `storage` (Storage) - Use a custom `Storage` instead of the default

Items created by the collection inherit the same `storage` instance, so global and collection-level headers apply to item loads and updates as well.

### Properties

#### `url` (URL)
Collection URL object.

#### `items` (Array)
Array of Item instances.

#### `length` (Number)
Number of items in collection.

#### `view` (CollectionView)
CollectionView instance.

#### `pageSize` (Number)
Items per page (default: 10).

#### `offset` (Number)
Current offset for pagination.

#### `total` (Number)
Total number of items available.

#### `type` (String)
Resource type name.

#### `template` (Function)
Handlebars template function for items.

#### `emptyview` (HTMLElement)
Element to show when collection is empty.

#### `filtering` (Filtering)
Filtering instance (if filter form is configured).

#### `paging` (Paging|null)
Paging instance (if pagination is configured). Set to `null` by default.

#### `itemListeners` (Object|null)
Event listeners to apply to all items created in this collection. Set to `null` by default.

**Example:**
```javascript
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    itemListeners: {
        load: (item) => log('Item loaded:', item.id),
        update: (item) => log('Item updated:', item.id)
    }
});
```

**Note:** You can also use `itemOn` as an alias for `itemListeners`.

### Methods

#### `on(eventName, callback)`

Register an event listener.

**Parameters:**
- `eventName` (String) - Event name
- `callback` (Function) - Callback function

**Returns:** Collection instance (for chaining)

**Events:**
- `beforeload` - Fired before loading data from remote
- `load` - Fired when collection loads
- `afterrender` - Fired after rendering
- `update` - Fired when collection updates

**Example:**
```javascript
collection.on('load', (collection) => {
    log('Collection loaded:', collection.items.length, 'items');
});
```

#### `off(eventName, callback?)`

Remove event listener(s).

**Parameters:**
- `eventName` (String) - Event name
- `callback` (Function, optional) - Specific callback to remove. If not provided, removes all listeners for the event

**Returns:** Collection instance (for chaining)

**Example:**
```javascript
const handler = (collection) => { log('Loaded'); };
collection.on('load', handler);
// Later...
collection.off('load', handler); // Remove specific listener
collection.off('load'); // Remove all 'load' listeners
collection.off(); // Remove all listeners
```

#### `once(eventName, callback)`

Register a one-time event listener (fires once, then removes itself).

**Parameters:**
- `eventName` (String) - Event name
- `callback` (Function) - Callback function

**Returns:** Collection instance (for chaining)

**Example:**
```javascript
collection.once('load', (collection) => {
    log('First load completed');
});
```

#### `emit(eventName, ...args)`

Manually trigger an event.

**Parameters:**
- `eventName` (String) - Event name
- `...args` - Arguments to pass to callbacks

**Returns:** Collection instance (for chaining)

**Example:**
```javascript
collection.emit('update', collection);
```

#### `hasListeners(eventName)`

Check if an event has any listeners.

**Parameters:**
- `eventName` (String) - Event name

**Returns:** Boolean - True if event has listeners

**Example:**
```javascript
if (collection.hasListeners('load')) {
    log('Collection has load listeners');
}
```

#### `setUrl(url)`

Set collection URL.

**Parameters:**
- `url` (String|Object) - URL string or object with url/insertUrl/updateUrl/deleteUrl

**Returns:** Collection instance

#### `loadFromRemote()` / `reload()` / `refresh()`

Load collection data from remote API.

**Returns:** Promise<Collection>

**Example:**
```javascript
collection.loadFromRemote().then((collection) => {
    log('Loaded', collection.items.length, 'items');
});
```

#### `loadFromData(data)`

Load collection from data array.

**Parameters:**
- `data` (Array) - Array of item data objects

**Returns:** Collection instance

#### `loadItem(itemData)`

Load a single item into the collection.

**Parameters:**
- `itemData` (Object) - Item data object

**Returns:** Item instance

#### `append(itemData)` / `newItem(itemData)` / `createItem(itemData)`

Create and append a new item to the collection.

**Parameters:**
- `itemData` (Object) - Item data object

**Returns:** Promise<Item>

**Example:**
```javascript
collection.append({
    title: 'New Post',
    content: 'Post content'
}).then((item) => {
    log('Item created:', item);
});
```

#### `removeItem(item)`

Remove item from collection (does not delete from server).

**Parameters:**
- `item` (Item) - Item instance to remove

#### `clear()` / `empty()`

Clear all items from collection.

**Returns:** Collection instance

#### `render()`

Render the collection view.

**Returns:** Collection instance

#### `setPageSize(val)`

Set page size.

**Parameters:**
- `val` (Number|String) - Page size value

**Returns:** Boolean - Success status

#### `setOffset(val)`

Set offset.

**Parameters:**
- `val` (Number|String) - Offset value

**Returns:** Boolean - Success status

#### `next()`

Next page

#### `prev()`

Previous page

#### `onupdate()`

Trigger the update event (called internally when collection is updated).

**Returns:** Collection instance (for chaining)

**Example:**
```javascript
collection.onupdate(); // Manually trigger update event
```
