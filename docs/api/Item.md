# Item API Reference

Represents a single resource item from an API.

## Class: Item

### Constructor

```javascript
new Item(options, data)
```

**Parameters:**
- `options` (Object) - Configuration options
- `data` (Object) - Optional initial data

**HTTP-related options** (when not using a parent collection’s `storage`):

- `adapter` (String|Object) - Data adapter name or instance (default: `'jsonapi'`, or parent collection’s adapter). See [Adapters Guide](../guides/adapters.md).
- `headers` (Object) - Default headers for this item’s `Storage`
- `ajaxOpts` (Object) - Options passed to `new Storage(...)` (merged with `headers`)
- `storage` (Storage) - Custom `Storage` instance

Headers are merged on each request with `KViews.defaultHeaders` (global first, then instance defaults, then per-call overrides).

### Properties

#### `id` (String|Number)
Item identifier.

#### `type` (String)
Resource type name.

#### `attributes` (Object)
Item attributes object.


#### `relationships` (Object)
Item relationships object.

#### `url` (URL)
Item URL object.

#### `updateUrl` (URL)
Update URL object.

#### `deleteUrl` (URL)
Delete URL object.

#### `views` (Array)
Array of ItemView instances bound to this item.

#### `collection` (Collection)
Parent collection (if part of a collection).

#### `adapter` (Object)
Data adapter used to parse remote responses and serialize updates (inherited from collection when applicable).

#### `strict` (Boolean)
Strict mode flag.

### Methods

#### `on(eventName, callback)`

Register an event listener.

**Parameters:**
- `eventName` (String) - Event name
- `callback` (Function) - Callback function

**Returns:** Item instance (for chaining)

**Events:**
- `beforeload` - Fired before loading data from remote
- `load` - Fired when item loads (from remote or data)
- `afterrender` - Fired after rendering
- `update` - Fired when item updates
- `remove` - Fired when item is removed

**Example:**
```javascript
item.on('update', (item) => {
    log('Item updated:', item);
});
```

#### `off(eventName, callback?)`

Remove event listener(s).

**Parameters:**
- `eventName` (String) - Event name
- `callback` (Function, optional) - Specific callback to remove. If not provided, removes all listeners for the event

**Returns:** Item instance (for chaining)

**Example:**
```javascript
const handler = (item) => { log('Updated'); };
item.on('update', handler);
// Later...
item.off('update', handler); // Remove specific listener
item.off('update'); // Remove all 'update' listeners
item.off(); // Remove all listeners
```

#### `once(eventName, callback)`

Register a one-time event listener (fires once, then removes itself).

**Parameters:**
- `eventName` (String) - Event name
- `callback` (Function) - Callback function

**Returns:** Item instance (for chaining)

**Example:**
```javascript
item.once('load', (item) => {
    log('First load completed');
});
```

#### `emit(eventName, ...args)`

Manually trigger an event.

**Parameters:**
- `eventName` (String) - Event name
- `...args` - Arguments to pass to callbacks

**Returns:** Item instance (for chaining)

**Example:**
```javascript
item.emit('update', item);
```

#### `hasListeners(eventName)`

Check if an event has any listeners.

**Parameters:**
- `eventName` (String) - Event name

**Returns:** Boolean - True if event has listeners

**Example:**
```javascript
if (item.hasListeners('load')) {
    log('Item has load listeners');
}
```

#### `setUrl(url, type)`

Set URL for the item.

**Parameters:**
- `url` (String) - URL string
- `type` (String) - Optional: 'delete' or 'update'

**Returns:** Item instance

**Example:**
```javascript
item.setUrl('/api/posts/1');
item.setUrl('/api/posts/1', 'update');
item.setUrl('/api/posts/1', 'delete');
```

#### `loadFromRemote()`

Load item data from remote API.

**Returns:** Promise<Item>

**Example:**
```javascript
item.loadFromRemote().then((item) => {
    log('Item loaded:', item);
});
```

#### `refresh()` / `reload()`

Aliases for `loadFromRemote()`.

#### `loadFromData(data)`

Load item from data object.

**Parameters:**
- `data` (Object) - Data object

**Returns:** Item instance

**Example:**
```javascript
item.loadFromData({
    title: 'My Post',
    content: 'Post content'
});
```

#### `loadFromRemoteDoc(data)`

Load item from a remote API response body. The active **adapter** determines how the document is parsed (JSON:API, plain REST, or custom).

**Parameters:**
- `data` (Object) - Parsed HTTP response body

**Returns:** Item instance

**Example:**
```javascript
item.loadFromRemoteDoc({
    data: {
        id: '1',
        type: 'posts',
        attributes: { title: 'My Post' }
    }
});
```

With `adapter: 'plain'`:
```javascript
item.loadFromRemoteDoc({ id: 1, title: 'My Post' });
```

#### `loadFromJSONAPIDoc(data)` *(deprecated)*

Deprecated alias for `loadFromRemoteDoc()`. Prefer `loadFromRemoteDoc()` for adapter-agnostic code.

**Parameters:**
- `data` (Object) - Remote API document

**Returns:** Item instance

#### `bindView(view, returnView)`

Bind an ItemView to this item.

**Parameters:**
- `view` (ItemView|HTMLElement) - View instance or element
- `returnView` (Boolean) - Return view instead of item

**Returns:** Item or ItemView instance

#### `unbindView(view)`

Unbind a view from this item.

**Parameters:**
- `view` (ItemView) - View to unbind

#### `update(updateData, opts)`

Update item attributes and relationships.

**Parameters:**
- `updateData` (Object) - Data to update
- `opts` (Object) - Options
  - `sync` (Boolean) - Sync immediately (default: true)
  - `rerender` (Boolean) - Re-render views (default: true)

**Returns:** Promise<Item>

**Example:**
```javascript
item.update(
    title: 'Updated Title'
}).then((item) => {
    log('Item updated');
});
```

#### `delete(ops)`

Delete item from server and remove element from UI accordingly.

**Parameters:**
- `ops` (Object) - Options
  - `sync` (Boolean) - Sync immediately (default: true)

**Returns:** Promise

**Example:**
```javascript
item.delete().then(() => {
    log('Item deleted');
});
```

#### `remove()`

Remove item from views and collection (does not delete from server).

**Returns:** Promise

#### `render(collectionView, addontop)`

Render all bound views.

**Parameters:**
- `collectionView` (CollectionView) - Optional collection view
- `addontop` (Boolean) - Add on top

#### `toJSON()`

Convert item to JSON API format.

**Returns:** Object

#### `sync()`

Sync pending operations.

**Returns:** Promise
