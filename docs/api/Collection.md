# Collection API Reference

Represents a collection of items from an API.

## Class: Collection

### Constructor

```javascript
new Collection(options)
```

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

### Methods

#### `on(eventName, callback)`

Register an event listener.

**Events:**
- `load` - Fired when collection loads
- `afterrender` - Fired after rendering
- `update` - Fired when collection updates

**Example:**
```javascript
collection.on('load', (collection) => {
    console.log('Collection loaded:', collection.items.length, 'items');
});
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
    console.log('Loaded', collection.items.length, 'items');
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
    console.log('Item created:', item);
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

Trigger update event.
