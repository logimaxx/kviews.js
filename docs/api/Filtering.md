# Filtering API Reference

Handles filter form submission and URL parameter management.

## Class: Filtering

### Constructor

```javascript
new Filtering(filterForm, collection)
```

**Parameters:**
- `filterForm` (HTMLElement|jQuery|String) - Form element, jQuery object, or selector
- `collection` (Collection) - Collection instance to filter

### Properties

#### `collection` (Collection)
Bound collection instance.

#### `el` (HTMLElement|jQuery)
Filter form element.

### Usage

The Filtering class automatically handles form submission and reset events:

**HTML:**
```html
<form id="filter-form">
    <input type="text" name="title" data-operator="contains">
    <input type="text" name="author">
    <button type="submit">Filter</button>
    <button type="reset">Reset</button>
</form>
```

**JavaScript:**
```javascript
const collection = KViews.createCollectionInstance('#collection', {
    url: '/api/posts',
    filter: '#filter-form'
});
```

### Form Field Operators

Use `data-operator` attribute to specify filter operator:

- `=` (default) - Equals
- `contains` - Contains
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal

**Example:**
```html
<input type="text" name="price" data-operator=">=">
```

### Filter Format

Filters are added to URL as comma-separated values:

```
/api/posts?filter=title=My Post,author=John,price>=100
```

### Methods

#### `handleSubmit(form)`

Handle form submit event (internal).

**Parameters:**
- `form` (HTMLElement) - Form element
