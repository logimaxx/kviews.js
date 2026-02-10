# Templates Guide

Learn how to use Handlebars templates with KViews.

## Template Basics

KViews uses Handlebars for template rendering. Templates are compiled from HTML strings and rendered with item or collection data.

## Inline Templates

The simplest way to define a template is inline in your HTML:

```html
<div id="posts">
    <div class="post">
        <h2>{{attributes.title}}</h2>
        <p>{{attributes.content}}</p>
        <small>ID: {{id}}</small>
    </div>
</div>
```

KViews automatically extracts the inner HTML as the template.

## Template Syntax

### Accessing Attributes

```handlebars
{{attributes.title}}
{{attributes.content}}
{{attributes.created_at}}
```

### Accessing Item Properties

```handlebars
{{id}}
{{type}}
```

### Conditional Rendering

```handlebars
{{#if attributes.published}}
    <span class="published">Published</span>
{{else}}
    <span class="draft">Draft</span>
{{/if}}
```

### Iterating Arrays

```handlebars
<ul>
    {{#each relationships.tags}}
        <li>{{attributes.name}}</li>
    {{/each}}
</ul>
```

### Nested Relationships

```handlebars
<div class="post">
    <h2>{{attributes.title}}</h2>
    <p>By {{relationships.author.attributes.name}}</p>
    <p>Tags:
        {{#each relationships.tags}}
            <span>{{attributes.name}}</span>
        {{/each}}
    </p>
</div>
```

### Helpers

Handlebars helpers work as expected:

```handlebars
{{#each relationships.comments}}
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
        <h2>{{attributes.title}}</h2>
        <p>{{attributes.content}}</p>
    </div>
</template>

<div id="posts"></div>

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
        <h2>{{attributes.title}}</h2>
    </div>
</div>

<div id="posts"></div>

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

```javascript
import Handlebars from 'handlebars';

const templateSource = `
    <div class="post">
        <h2>{{attributes.title}}</h2>
        <p>{{attributes.content}}</p>
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
        <h2>{{attributes.title}}</h2>
        <small>{{formatDate attributes.created_at}}</small>
    </div>
`);
```

## Collection Templates

### Collection Template Structure

```html
<div id="posts">
    <!-- This is the item template -->
    <div class="post">
        <h2>{{attributes.title}}</h2>
        <p>{{attributes.content}}</p>
    </div>
</div>
```

Each item in the collection is rendered using this template.

### Empty Collection Template

```html
<div id="posts">
    <div class="post">
        <h2>{{attributes.title}}</h2>
    </div>
</div>

<div id="empty-posts" style="display:none;">
    <p>No posts found.</p>
</div>

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
    <h1>{{attributes.title}}</h1>
    <div class="content">
        {{attributes.content}}
    </div>
    <div class="meta">
        <p>Author: {{relationships.author.attributes.name}}</p>
        <p>Created: {{attributes.created_at}}</p>
    </div>
</div>
```

## Advanced Template Patterns

### Nested Collections

```handlebars
<div class="post">
    <h2>{{attributes.title}}</h2>
    
    <h3>Comments:</h3>
    <div class="comments">
        {{#each relationships.comments}}
            <div class="comment">
                <p>{{attributes.text}}</p>
                <small>By {{relationships.author.attributes.name}}</small>
            </div>
        {{/each}}
    </div>
</div>
```

### Conditional Classes

```handlebars
<div class="post {{#if attributes.published}}published{{else}}draft{{/if}}">
    <h2>{{attributes.title}}</h2>
</div>
```

### Safe HTML

```handlebars
{{{attributes.content}}} <!-- Unescaped HTML -->
{{attributes.content}}    <!-- Escaped HTML -->
```

### Custom Helpers

```javascript
import Handlebars from 'handlebars';

Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('gt', (a, b) => a > b);
Handlebars.registerHelper('lt', (a, b) => a < b);

// Use in template
{{#if (gt attributes.views 100)}}
    <span class="popular">Popular</span>
{{/if}}
```

### Partial Templates

```javascript
import Handlebars from 'handlebars';

Handlebars.registerPartial('user', `
    <div class="user">
        <h3>{{attributes.name}}</h3>
        <p>{{attributes.email}}</p>
    </div>
`);

// Use partial
const template = Handlebars.compile(`
    <div class="post">
        <h2>{{attributes.title}}</h2>
        {{> user relationships.author}}
    </div>
`);
```

## Template Best Practices

### 1. Keep Templates Simple

```handlebars
<!-- Good -->
<div class="post">
    <h2>{{attributes.title}}</h2>
    <p>{{attributes.content}}</p>
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
<p>{{truncate attributes.content 100}}</p>
```

### 3. Handle Missing Data

```handlebars
{{#if attributes.description}}
    <p>{{attributes.description}}</p>
{{else}}
    <p>No description available</p>
{{/if}}
```

### 4. Escape User Content

```handlebars
<!-- Automatically escaped -->
{{attributes.user_input}}

<!-- Only use unescaped if you trust the source -->
{{{attributes.trusted_html}}}
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
