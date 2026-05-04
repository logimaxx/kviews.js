# Templates Guide

Learn how to use Handlebars templates with KViews.

## Runtime dependencies

Templates are Handlebars, but **KViews also requires jQuery** for the DOM. In the browser, load **jQuery**, then **Handlebars**, then the KViews bundle (or those globals before a `<script type="module">` that imports `./src/index.js`). See [Getting Started](./getting-started.md).

## Template Basics

KViews uses Handlebars for template rendering. Templates are compiled from HTML strings and rendered with item or collection data.

**Important:** In templates, `attributes` and `relationships` are exposed directly. You don't need to use `{{attributes.property}}` - just use `{{property}}`.

## Inline Templates

The simplest way to define a template is inline in your HTML:

```html
<div id="posts">
    <div class="post">
        <h2>{{title}}</h2>
        <p>{{content}}</p>
        <small>ID: {{id}}</small>
    </div>
</div>
```

KViews automatically extracts the inner HTML as the template.

## Template Syntax

### Accessing Attributes

Attributes are exposed directly in templates (no `attributes.` prefix needed):

```handlebars
{{title}}
{{content}}
{{created_at}}
```

**Note:** KViews automatically flattens `attributes` into the template context, so `{{title}}` works instead of `{{attributes.title}}`.

### Accessing Item Properties

```handlebars
{{id}}
{{type}}
```

### Accessing Relationships

Relationships are exposed directly, but you still access nested properties:

```handlebars
{{author.attributes.name}}  <!-- For 1:1 relationships -->
{{author.id}}               <!-- Access relationship ID -->
```

### Conditional Rendering

```handlebars
{{#if published}}
    <span class="published">Published</span>
{{else}}
    <span class="draft">Draft</span>
{{/if}}
```

### Iterating Arrays

```handlebars
<ul>
    {{#each tags}}
        <li>{{attributes.name}}</li>
    {{/each}}
</ul>
```

### Nested Relationships

```handlebars
<div class="post">
    <h2>{{title}}</h2>
    <p>By {{author.attributes.name}}</p>
    <p>Tags:
        {{#each tags}}
            <span>{{attributes.name}}</span>
        {{/each}}
    </p>
</div>
```

**Note:** Relationships are exposed directly, so use `{{author}}` instead of `{{relationships.author}}`. However, nested relationship attributes still use `{{author.attributes.name}}`.

### Helpers

Handlebars helpers work as expected:

```handlebars
{{#each comments}}
    <div class="comment">
        <p>{{attributes.text}}</p>
        <small>{{formatDate attributes.created_at}}</small>
    </div>
{{/each}}
```

## External Templates

### Using Template Element

```html
<template id="post-template">
    <div class="post">
        <h2>{{title}}</h2>
        <p>{{content}}</p>
    </div>
</template>

<div id="posts"></div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script type="module">
    import { KViews } from './src/index.js';
    
    KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts',
        template: '#post-template'
    });
</script>
```

### Using Hidden Element

```html
<div id="post-template" style="display:none;">
    <div class="post">
        <h2>{{title}}</h2>
    </div>
</div>

<div id="posts"></div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script type="module">
    import { KViews } from './src/index.js';
    
    KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts',
        template: '#post-template'
    });
</script>
```

## Custom Template Functions

### Compile Your Own Template

Keep **jQuery** available globally for KViews when using compiled templates in the browser.

```javascript
import Handlebars from 'handlebars';

const templateSource = `
    <div class="post">
        <h2>{{title}}</h2>
        <p>{{content}}</p>
    </div>
`;

const template = Handlebars.compile(templateSource);

KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts',
    template: template
});
```

### Using Handlebars Helpers

```javascript
import Handlebars from 'handlebars';

// Register helper
Handlebars.registerHelper('formatDate', (date) => {
    return new Date(date).toLocaleDateString();
});

// Use in template
const template = Handlebars.compile(`
    <div>
        <h2>{{title}}</h2>
        <small>{{formatDate created_at}}</small>
    </div>
`);
```

## Collection Templates

### Collection Template Structure

```html
<div id="posts">
    <!-- This is the item template -->
    <div class="post">
        <h2>{{title}}</h2>
        <p>{{content}}</p>
    </div>
</div>
```

Each item in the collection is rendered using this template.

### Empty Collection Template

```html
<div id="posts">
    <div class="post">
        <h2>{{title}}</h2>
    </div>
</div>

<div id="empty-posts" style="display:none;">
    <p>No posts found.</p>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script type="module">
    import { KViews } from './src/index.js';
    
    KViews.createCollectionInstance('#posts', {
        url: '/api/posts',
        type: 'posts',
        emptyview: '#empty-posts'
    });
</script>
```

## Item Templates

### Single Item Template

```html
<div id="post-detail">
    <h1>{{title}}</h1>
    <div class="content">
        {{content}}
    </div>
    <div class="meta">
        <p>Author: {{author.attributes.name}}</p>
        <p>Created: {{created_at}}</p>
    </div>
</div>
```

## Advanced Template Patterns

### Nested Collections

```handlebars
<div class="post">
    <h2>{{title}}</h2>
    
    <h3>Comments:</h3>
    <div class="comments">
        {{#each comments}}
            <div class="comment">
                <p>{{attributes.text}}</p>
                <small>By {{author.attributes.name}}</small>
            </div>
        {{/each}}
    </div>
</div>
```

### Conditional Classes

```handlebars
<div class="post {{#if published}}published{{else}}draft{{/if}}">
    <h2>{{title}}</h2>
</div>
```

### Safe HTML

```handlebars
{{{content}}} <!-- Unescaped HTML -->
{{content}}    <!-- Escaped HTML -->
```

### Custom Helpers

```javascript
import Handlebars from 'handlebars';

Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('gt', (a, b) => a > b);
Handlebars.registerHelper('lt', (a, b) => a < b);

// Use in template
{{#if (gt views 100)}}
    <span class="popular">Popular</span>
{{/if}}
```

### Partial Templates

```javascript
import Handlebars from 'handlebars';

Handlebars.registerPartial('user', `
    <div class="user">
        <h3>{{name}}</h3>
        <p>{{email}}</p>
    </div>
`);

// Use partial
const template = Handlebars.compile(`
    <div class="post">
        <h2>{{title}}</h2>
        {{> user author}}
    </div>
`);
```

## Template Best Practices

### 1. Keep Templates Simple

```handlebars
<!-- Good -->
<div class="post">
    <h2>{{title}}</h2>
    <p>{{content}}</p>
</div>

<!-- Avoid complex logic in templates -->
```

### 2. Use Helpers for Complex Logic

```javascript
// Register helper
Handlebars.registerHelper('truncate', (str, len) => {
    return str.length > len ? str.substring(0, len) + '...' : str;
});

// Use in template
<p>{{truncate content 100}}</p>
```

### 3. Handle Missing Data

```handlebars
{{#if description}}
    <p>{{description}}</p>
{{else}}
    <p>No description available</p>
{{/if}}
```

### 4. Escape User Content

```handlebars
<!-- Automatically escaped -->
{{user_input}}

<!-- Only use unescaped if you trust the source -->
{{{trusted_html}}}
```

## Debugging Templates

Enable debug logging:

```javascript
window.kviewsLogLevel = 3; // Maximum logging

// Template errors will be logged to console
```

Common issues:
- Missing data: Check that attributes exist
- Template not rendering: Verify Handlebars is loaded
- Syntax errors: Check Handlebars syntax
