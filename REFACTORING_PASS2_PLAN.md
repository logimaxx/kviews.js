# KViews Refactoring Pass 2 - Plan

## Files to Modify

### Core Classes
- `src/Collection.js` - Remove pseudo-array, fix lifecycle, clean parser usage
- `src/Item.js` - Clarify render context contract
- `src/dataParser.js` - Remove dead code, clarify responsibilities

### Factory & Exports
- `src/KViews.js` - Harden getOrUpdateInstance()
- `src/index.js` - Clean up public exports

### Storage & Errors
- `src/Storage.js` - Improve error classification
- `src/errors.js` - Add KViewsNetworkError if needed

### URL
- `src/URL.js` - Simplify where possible

## Implementation Steps

1. Fix Collection pseudo-array behavior
2. Fix Collection lifecycle (clear/remove/destroy)
3. Clean parser layer
4. Clarify render context contract
5. Harden getOrUpdateInstance()
6. Clean public exports
7. Improve error classification
8. Update tests
