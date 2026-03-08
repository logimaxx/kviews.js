# KViews Refactoring Plan

## STEP 1: Current Structure Analysis

### Core Files:
- `src/index.js` - Entry point, exports
- `src/KViews.js` - Factory class
- `src/Collection.js` - Collection management
- `src/Item.js` - Item management
- `src/CollectionView.js` - Collection rendering
- `src/ItemView.js` - Item rendering
- `src/Storage.js` - HTTP operations
- `src/dataParser.js` - JSON:API parsing (HAS GLOBAL STATE)
- `src/URL.js` - URL parsing (FRAGILE REGEX)
- `src/Filtering.js` - Filter form handling
- `src/Paging.js` - Pagination UI
- `src/utilities.js` - Form helpers
- `src/utils.js` - Internal utilities

### Critical Issues Identified:

1. **Global Parser State** (`src/dataParser.js:8`)
   - `let itemsArr = {};` - module-level mutable state
   - Used in `flattenDoc()` function
   - Must be made local per parse operation

2. **State Mutation in Rendering** (`src/ItemView.js:100-103`)
   - Creates shallow copy: `Object.assign({}, this.item.attributes)`
   - Then merges relationships: `Object.assign(data, this.item.relationships)`
   - Risk: if relationships contain object references, mutations could leak back

3. **JSON:API Compliance** (`src/dataParser.js:22, 95`)
   - Uses `includes` instead of standard `included`
   - Should support both for compatibility but canonicalize to `included`

4. **Fragile URL Parser** (`src/URL.js:22`)
   - Custom regex-based parser
   - Should wrap standard URL/URLSearchParams

5. **Weak Error Model** (`src/Storage.js:114-119`)
   - Throws plain objects, not Error instances
   - Should use Error subclasses

6. **No Cleanup Lifecycle**
   - No destroy() methods on any classes
   - Event handlers, jQuery data, references not cleaned up

7. **API Surface Confusion**
   - Aliases: `loadFromRemote()` / `refresh()` / `reload()` / `load_from_data_source()`
   - Aliases: `append()` / `createItem()` / `newItem()`
   - Inconsistent naming: snake_case vs camelCase

## STEP 2: Refactoring Plan

### Phase 1: Error Model & Internal Structure
**Files:** `src/errors.js` (NEW), `src/Storage.js`
- Create error class hierarchy
- Update Storage to throw proper errors

### Phase 2: JSON:API Parser Cleanup
**Files:** `src/dataParser.js`, `src/jsonapi/` (NEW directory)
- Remove global state
- Support both `includes` and `included` (canonicalize to `included`)
- Split into parser and serializer modules

### Phase 3: URL Parser Improvement
**Files:** `src/URL.js`
- Wrap standard URL/URLSearchParams
- Keep backward compatibility wrapper

### Phase 4: Render Context & State Safety
**Files:** `src/Item.js`, `src/ItemView.js`
- Add `getRenderContext()` method to Item
- Update ItemView to use render context
- Ensure no state mutation

### Phase 5: Cleanup Lifecycle
**Files:** All view/model classes
- Add `destroy()` methods
- Clean up event handlers, jQuery data, references

### Phase 6: API Standardization
**Files:** `src/Collection.js`, `src/Item.js`
- Standardize method names (camelCase)
- Mark deprecated aliases
- Reduce API surface

### Phase 7: Public vs Internal Boundaries
**Files:** `src/index.js`, internal modules
- Mark internal utilities clearly
- Export only public API

## STEP 3: Implementation Order

1. Create error classes
2. Fix global parser state
3. Add render context method
4. Fix URL parser
5. Add destroy methods
6. Standardize API
7. Update tests

## STEP 4: Backward Compatibility Strategy

- Keep all existing public methods working
- Add deprecation comments for aliases
- New canonical methods preferred but old ones still work
- Document migration path

## STEP 5: Testing Strategy

- Update existing tests
- Add tests for:
  - Render context doesn't mutate state
  - Parser has no global state
  - Destroy cleanup works
  - Error classes work correctly
  - JSON:API `included` parsing
