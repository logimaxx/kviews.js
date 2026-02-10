# Utilities API Reference

Utility functions for form handling and other operations.

## Accessing Utilities

Utilities are available through multiple ways:

### 1. Via KViews.helpers (Recommended)

```javascript
// Bundle version
KViews.helpers.fillForm('#edit-form', item);

// ES6 Modules
import { KViews } from './src/index.js';
KViews.helpers.fillForm('#edit-form', item);
```

### 2. Direct Import

```javascript
import { utilities } from './src/index.js';

utilities.fillForm('#edit-form', item);
```

## Utilities Object

### `KViews.helpers.fillForm(form, instance)`

Fill form fields with data from an Item or Collection instance.

**Parameters:**
- `form` (HTMLElement|jQuery|String) - Form element
- `instance` (Item|Collection) - Item or Collection instance

**Returns:** null

**Example:**
```javascript
// Using KViews.helpers (recommended)
KViews.helpers.fillForm('#edit-form', item);
```

### `KViews.helpers.captureFormSubmit(form, callback)`

Capture form submit event and redirect to callback.

**Parameters:**
- `form` (HTMLElement|jQuery|String) - Form element
- `callback` (Function) - Callback function `(formData, event) => {}`

**Returns:** jQuery object or HTMLElement

**Example:**
```javascript
KViews.helpers.captureFormSubmit('#create-form', (formData, event) => {
    collection.append({ attributes: formData });
});
```

### `KViews.helpers.fetchFormData(form)`

Extract form data as object. Handles array notation (`name[]`) and supports multiple input types.

**Parameters:**
- `form` (HTMLElement|jQuery|String) - Form element, jQuery object, or CSS selector

**Returns:** Object

**Example:**
```javascript
// Using DOM element
const formData = KViews.helpers.fetchFormData(document.getElementById('form'));

// Using jQuery selector
const formData = KViews.helpers.fetchFormData('#my-form');

// Result: { name: 'value', email: 'user@example.com', tags: ['tag1', 'tag2'] }
// Note: Fields with name="tags[]" will be collected into an array
```

### `KViews.helpers.extractFormData(form)`

Extract form data (alias for `fetchFormData`). Provided for backward compatibility.

**Parameters:**
- `form` (HTMLElement|jQuery|String) - Form element, jQuery object, or CSS selector

**Returns:** Object

## Form Data Format

Form data is extracted as key-value pairs:

```javascript
{
    fieldName: 'fieldValue',
    arrayField: ['value1', 'value2'], // For fields with name="field[]"
    checkboxField: 'checkedValue'     // Only if checked
}
```

## Relationship Handling

When filling forms with relationships:

- **1:1 relationships** - Sets the related item's ID
- **1:N relationships** - Sets array of IDs for multi-select fields

**Example:**
```javascript
// Item with relationship
item.relationships.author = { id: '123', attributes: { name: 'John' } };

// Form field will be filled with ID
KViews.helpers.fillForm('#form', item);
// <select name="author"> will have option with value="123" selected
```

## Complete Example

```javascript
// Bundle version
<script src="./dist/kviews.js"></script>
<script>
    const collection = KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts'
    });
    
    // Fill form with item data
    const item = KViews.createItemInstance('#post', { url: '/api/posts/1' });
    item.on('load', () => {
        KViews.helpers.fillForm('#edit-form', item);
    });
    
    // Capture form submit
    KViews.helpers.captureFormSubmit('#create-form', (formData) => {
        collection.append({ attributes: formData });
    });
</script>
```

```javascript
// ES6 Modules
import { KViews } from './src/index.js';

const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});

// Access utilities via KViews.helpers
KViews.helpers.captureFormSubmit('#create-form', (formData) => {
    collection.append({ attributes: formData });
});
```
