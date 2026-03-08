# JSON:API Parser Refactoring Summary

## Overview

Refactored the JSON:API parser layer to make its purpose explicit and its flow consistent. The parser now clearly communicates its role as a **hydration layer** that replaces relationship references with actual resource objects.

## New Parser Design

### Core Functions

The parser now exposes explicit responsibilities through these functions:

1. **`getIncludedResources(doc)`**
   - Extracts included resources from JSON:API document
   - Supports both standard `included` and legacy `includes` fields
   - Returns array of included resource objects

2. **`buildResourceIndex(doc)`**
   - Builds a Map-based index of all resources (primary + included)
   - Key format: `"type/id"` -> resource object
   - Enables fast O(1) lookup for relationship resolution

3. **`hydrateResource(resource, resourceIndex, visited)`**
   - Hydrates a single resource's relationships recursively
   - Replaces `{type, id}` references with actual resource objects
   - Handles both to-one and to-many relationships
   - Prevents infinite recursion with `visited` set for cycle detection
   - Deep clones resources to avoid mutation issues

4. **`hydrateDocumentData(doc)`**
   - Main entry point for document hydration
   - Builds resource index and hydrates all primary data
   - Returns hydrated single resource or array of resources
   - Handles both collection and single-item responses

5. **`parseItemData(data)`**
   - Parses item data from JSON:API document or already-hydrated resource
   - Extracts URL from document links if available
   - Returns hydrated item ready for `Item.loadFromData()`

6. **`parseCollectionData(doc)`**
   - Parses collection data from JSON:API document
   - Returns array of hydrated resources ready for `Collection.loadFromData()`

### Architecture Flow

```
JSON:API Document
    ↓
getIncludedResources() → Extract included resources
    ↓
buildResourceIndex() → Build type/id → resource index
    ↓
hydrateDocumentData() → Hydrate primary data recursively
    ↓
parseItemData() / parseCollectionData() → Extract and return hydrated resources
    ↓
Item.loadFromData() / Collection.loadFromData() → Load into KViews instances
```

## What Was Removed/Replaced

### Removed

- **`flattenDoc()` redundant usage**: The function is kept for backward compatibility but is no longer used in the main flow. Its functionality is now handled by `getIncludedResources()` and `buildResourceIndex()`.

### Replaced

- **`buildDb()` internal usage**: Replaced with `buildResourceIndex()` + `hydrateDocumentData()`. The `buildDb()` function is kept for backward compatibility but marked as deprecated.

### Improved

- **Relationship hydration**: Now explicit and recursive with cycle detection
- **Resource indexing**: Uses Map for better performance and clarity
- **Document processing**: Clear separation between indexing and hydration

## How Collection and Item Parsing Use Hydration

### Collection Parsing

**Before**:
```javascript
receiveRemoteData(data) {
    flattenDoc(data);  // Return value ignored
    buildDb(data);    // Mutates document in place
    data = this.parse(data);
    // ...
}
```

**After**:
```javascript
receiveRemoteData(data) {
    // Hydrate relationships and parse collection data
    const hydratedData = parseCollectionData(data);
    
    // Extract metadata and return hydrated data array
    data = this.parse({ ...data, data: hydratedData });
    // ...
}
```

### Item Parsing

**Before**:
```javascript
loadFromRemote(data) {
    Object.assign(this, parseItemData(data, buildDb(data)));
    // ...
}
```

**After**:
```javascript
loadFromRemote(data) {
    // Parse and hydrate item data (relationships are resolved)
    const parsedData = parseItemData(data);
    Object.assign(this, parsedData);
    // ...
}
```

## Backward Compatibility

### Preserved Functions

- **`buildDb()`**: Kept for backward compatibility, marked as `@deprecated`
- **`flattenDoc()`**: Kept for backward compatibility, marked as `@deprecated`

These functions still work but delegate to the new hydration layer internally.

### Behavior Compatibility

- All existing KViews behavior is preserved
- Relationship hydration works the same way, just more explicitly
- Support for both `included` and legacy `includes` is maintained
- No breaking changes to public API

## Key Improvements

1. **Explicit Intent**: Function names clearly communicate purpose (hydrate, index, parse)
2. **Clear Flow**: Document → Index → Hydrate → Parse → Load
3. **Cycle Safety**: Prevents infinite recursion with visited set
4. **No Mutation**: Deep clones prevent accidental state mutation
5. **Better Performance**: Map-based indexing for O(1) lookups
6. **Comprehensive Comments**: Code documents the hydration process clearly

## Example: Hydration Flow

**Input JSON:API Document**:
```json
{
  "data": {
    "id": "1",
    "type": "posts",
    "attributes": { "title": "Hello" },
    "relationships": {
      "author": {
        "data": { "id": "10", "type": "users" }
      }
    }
  },
  "included": [
    {
      "id": "10",
      "type": "users",
      "attributes": { "name": "Alice" },
      "relationships": {
        "company": {
          "data": { "id": "20", "type": "companies" }
        }
      }
    },
    {
      "id": "20",
      "type": "companies",
      "attributes": { "name": "Acme" }
    }
  ]
}
```

**After Hydration**:
```javascript
{
  id: "1",
  type: "posts",
  attributes: { title: "Hello" },
  relationships: {
    author: {
      id: "10",
      type: "users",
      attributes: { name: "Alice" },
      relationships: {
        company: {
          id: "20",
          type: "companies",
          attributes: { name: "Acme" }
        }
      }
    }
  }
}
```

The `{type, id}` references are replaced with actual resource objects, nested relationships are resolved, and the result is ready for KViews to load.

## Testing

- All existing tests pass (68/68)
- New comprehensive test suite for hydration layer (`tests/unit/parser-hydration.test.js`)
- Tests cover:
  - Included resource extraction
  - Resource indexing
  - To-one and to-many relationship hydration
  - Nested relationship hydration
  - Cycle detection
  - Null relationships
  - Collection and item parsing

## Files Changed

- `src/dataParser.js`: Complete refactor with new hydration layer
- `src/Collection.js`: Updated to use `parseCollectionData()`
- `src/Item.js`: Updated to use `parseItemData()` without `buildDb()`
- `tests/unit/parser-hydration.test.js`: New comprehensive test suite

## Summary

The parser layer now reads like an intentional hydration system rather than a set of ad-hoc helper functions. The flow is explicit: **JSON:API document in → hydrated resource graph out**. All relationship references are replaced with actual objects from the same document, nested relationships are resolved recursively, and the result is ready for KViews to consume.
