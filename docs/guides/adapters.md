# Data adapters

KViews separates **how data is fetched** (`Storage`) from **how responses are parsed and serialized** (data **adapters**).

- **`Storage`** — HTTP transport (Fetch API, headers, URLs).
- **Adapter** — Wire format: parse list/detail responses, build create/update bodies, list query params.

Templates and the runtime model stay the same regardless of adapter: each `Item` still has `id`, `type`, `attributes`, and `relationships`, and Handlebars still uses flattened keys like `{{title}}` and `{{author.name}}`.

## Built-in adapters

| Name | Class | Default? | Use when |
|------|-------|----------|----------|
| `'jsonapi'` | `JsonApiAdapter` | Yes | Backend speaks JSON:API (`application/vnd.api+json`, `data` / `included`, compound documents) |
| `'plain'` | `PlainRestAdapter` | No | Flat JSON REST APIs (`application/json`, arrays or `{ data: [...] }`, nested objects by `id`) |

If you omit `adapter`, KViews uses **`jsonapi`** (backward compatible).

## JSON:API (default)

No extra configuration:

```javascript
KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
});
```

Expected list response shape:

```json
{
  "data": [
    { "id": "1", "type": "posts", "attributes": { "title": "Hello" } }
  ],
  "meta": { "totalRecords": 100, "offset": 0 }
}
```

See [Collections guide](./collections.md) and the [Data format section](../KVIEWS_AI_DOCUMENTATION.md#data-format) in the AI reference for full JSON:API details.

## Plain REST (`adapter: 'plain'`)

For APIs that return flat JSON objects:

```javascript
KViews.createCollectionInstance('#users', {
    url: '/api/users',
    type: 'users',
    adapter: 'plain',
    pageSize: 20,
});
```

### Supported response shapes

**Collection** (any of):

```json
[
  { "id": 1, "name": "Ada", "email": "ada@example.com" }
]
```

```json
{
  "data": [
    { "id": 1, "name": "Ada", "author": { "id": 9, "name": "Grace" } }
  ],
  "total": 42,
  "offset": 0
}
```

Also recognized without configuration: `items`, `results` arrays; totals in `total`, `count`, `totalCount`, or `meta.totalRecords`.

**Single item** (detail, create response):

```json
{ "id": 1, "name": "Ada", "author": { "id": 9, "name": "Grace" } }
```

```json
{ "data": { "id": 1, "name": "Ada" } }
```

Nested objects that contain an `id` field are normalized into **relationships** on the canonical model. Everything else becomes **attributes**.

### Write format

Create and update use **`application/json`** with flat objects (not a JSON:API envelope):

```javascript
// POST body after collection.insert({ name: 'New user' })
{ "name": "New user", "type": "users" }

// PATCH body after item.update({ name: 'Renamed' })
{ "id": "1", "type": "users", "name": "Renamed" }
```

### List query parameters

By default the plain adapter sends **`offset`** and **`limit`**:

```
GET /api/users?offset=0&limit=20
```

Page-based APIs:

```javascript
adapter: new PlainRestAdapter({
    paginationStyle: 'page',  // sends page + limit (1-based page number)
}),
```

### Custom paths and field names

When your API uses different property names or nesting:

```javascript
import { PlainRestAdapter } from '@logimaxx/kviews.js';

KViews.createCollectionInstance('#reports', {
    url: '/api/reports',
    type: 'reports',
    adapter: new PlainRestAdapter({
        itemsPath: 'results.items',   // dot path to the array
        itemPath: 'result',           // dot path for single-item wrappers
        totalPath: 'results.total',
        offsetPath: 'results.offset',
        idField: 'uuid',              // primary key field (default: id)
        typeField: 'resourceType',    // optional type on wire objects
        offsetParam: 'skip',
        limitParam: 'take',
        embedRelationships: true,     // send full nested objects on write, not { id } stubs
    }),
});
```

## Global default adapter

Use when most of your app targets one wire format:

```javascript
import KViews, { PlainRestAdapter } from '@logimaxx/kviews.js';

KViews.defaultAdapter = 'plain';
// or
KViews.defaultAdapter = new PlainRestAdapter({ paginationStyle: 'page' });
```

Per-instance `adapter` still overrides the global default.

## Register a custom adapter

```javascript
import KViews from '@logimaxx/kviews.js';

KViews.registerAdapter('my-api', myAdapter);
KViews.createCollectionInstance('#list', { adapter: 'my-api', ... });
```

You can also pass an adapter **instance** directly (no registration):

```javascript
KViews.createCollectionInstance('#list', {
    adapter: new PlainRestAdapter({ itemsPath: 'payload' }),
    ...
});
```

Items created inside a collection **inherit** `collection.adapter`.

## Custom adapter interface

Implement an object (or class) with the methods below. Method names must match — `Collection` and `Item` call them directly.

### Read path

| Method | Purpose |
|--------|---------|
| `isSingleItemResponse(data)` | `true` when a response is one resource (e.g. after POST), not a list |
| `parseCollectionResponse(doc, { type })` | Returns `{ items: CanonicalItem[], meta: { totalRecords?, offset? } }` |
| `parseItemResponse(data, { collection?, type? })` | Returns one canonical resource for `Item.loadFromData()` |
| `validateItemRemoteDoc(data, { collection? })` | Throw if an item endpoint returned a collection document |
| `inferItemType(data)` | Optional type string from the wire document |
| `extractMetadata(data)` | `{ totalRecords?, offset? }` without mutating collection |
| `applyMetadata(collection, meta)` | Apply `total` / `offset` on the collection instance |

**Canonical item** shape (what `parse*` methods return):

```javascript
{
    id: '1',              // string recommended
    type: 'posts',        // optional if collection.type is set
    attributes: { title: 'Hello' },
    relationships: {
        author: { id: '9', type: 'users', attributes: { name: 'Ada' }, relationships: {} },
        tags: [ /* array of canonical items */ ],
    },
}
```

### Write path

| Method | Purpose |
|--------|---------|
| `serializeForCreate(itemData, { type? })` | Returns `{ body: string, contentType: string }` |
| `serializeForUpdate(toUpdate)` | `toUpdate` has `{ id, type?, attributes, relationships }` where each relationship value was produced by `serializeRelationship` |
| `serializeRelationship(rel)` | Convert runtime relationship (object, array, or `null`) to wire form stored in `toUpdate.relationships` |

### List queries

| Method | Purpose |
|--------|---------|
| `applyListQuery(url, { type?, offset?, pageSize? })` | Mutate `url.parameters` before `loadFromRemote()` |

### Minimal stub example

```javascript
const myAdapter = {
    name: 'my-api',

    isSingleItemResponse(data) {
        return data && !Array.isArray(data) && data.id != null;
    },

    parseCollectionResponse(doc, { type }) {
        const rows = Array.isArray(doc) ? doc : doc.items ?? [];
        return {
            items: rows.map(row => ({
                id: String(row.id),
                type,
                attributes: { ...row },
                relationships: {},
            })),
            meta: { totalRecords: doc.total },
        };
    },

    parseItemResponse(data) {
        return {
            id: String(data.id),
            attributes: { ...data },
            relationships: {},
        };
    },

    validateItemRemoteDoc() {},
    inferItemType() {},
    extractMetadata(doc) {
        return { totalRecords: doc.total };
    },
    applyMetadata(collection, meta) {
        if (meta.totalRecords != null) collection.total = meta.totalRecords;
    },

    applyListQuery(url, { offset, pageSize }) {
        url.parameters.offset = offset;
        url.parameters.limit = pageSize;
    },

    serializeForCreate(itemData) {
        return { body: JSON.stringify(itemData), contentType: 'application/json' };
    },

    serializeForUpdate(toUpdate) {
        return {
            body: JSON.stringify({ ...toUpdate.attributes, id: toUpdate.id }),
            contentType: 'application/json',
        };
    },

    serializeRelationship(rel) {
        return rel?.id ?? rel;
    },
};

KViews.registerAdapter('my-api', myAdapter);
```

## Loading remote documents on Item

After a fetch, items are loaded through the adapter:

```javascript
// Preferred
item.loadFromRemoteDoc(responseBody);

// Deprecated alias (still works)
item.loadFromJSONAPIDoc(responseBody);
```

For local/static data without HTTP, use `loadFromData()` — adapters are not involved.

## What adapters do not cover yet

These still use KViews conventions independent of the adapter:

- **Filter / sort query params** on collection URLs (`filter=`, `sort=`) — JSON:API-style, not adapter-driven
- **GraphQL** — query-driven; use a separate client or custom `Storage`, not the adapter layer
- **Cursor pagination** — only offset/limit (or page/limit) via `applyListQuery`

For one-off backends, you can bypass adapters with `dontload: true`, fetch yourself, and call `collection.loadFromData()` / `item.loadFromData()`.

## Exports (ES modules)

```javascript
import KViews, {
    JsonApiAdapter,
    PlainRestAdapter,
    resolveAdapter,
    registerAdapter,
    setDefaultAdapter,
    getDefaultAdapter,
} from '@logimaxx/kviews.js';
```

## See also

- [Collection API](../api/Collection.md) — `adapter` option
- [Item API](../api/Item.md) — `loadFromRemoteDoc()`
- [KViews API](../api/KViews.md) — `defaultAdapter`, `registerAdapter()`
- [Collections guide](./collections.md) — pagination and CRUD
- [Items guide](./items.md) — detail views and updates
