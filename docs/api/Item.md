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
- `load` - Fired when item loads
- `update` - Fired when item updates
- `remove` - Fired when item is removed

**Example:**
```javascript
item.on('update', (item) => {
    console.log('Item updated:', item);
});
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
    console.log('Item loaded:', item);
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

#### `loadFromJSONAPIDoc(data)`

Load item from JSON API document format.

**Parameters:**
- `data` (Object) - JSON API document

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
    console.log('Item updated');
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
    console.log('Item deleted');
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
