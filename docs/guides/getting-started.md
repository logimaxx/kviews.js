# Getting Started with KViews

This guide will help you get started with KViews in your project.

## Installation

### Option 1: Bundle (Recommended for Simple Projects)

Include the bundled file - no module system required:

```html
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
```

KViews will be available globally as `window.KViews`.

### Option 2: ES6 Modules

Copy the `src/` directory to your project and import:

```html
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script type="module">
    import { KViews } from './src/index.js';
    // Use KViews here
</script>
```

## Requirements

- **Handlebars** - Required for template compilation
  ```html
  <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
  ```

- **jQuery** (Optional) - Falls back to native DOM APIs if not available
  ```html
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  ```

- **Modern Browser** - ES6 module support required

## Basic Setup

### 1. HTML Structure

Create your HTML with a container element and a template:

```html
<div id="posts-collection">
    <div class="post">
        <h2>{{title}}</h2>
        <p>{{content}}</p>
    </div>
</div>
```

### 2. JavaScript Initialization

#### Using Bundle (No Module System)

```html
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="./dist/kviews.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const collection = KViews.createCollectionInstance(
            document.getElementById('posts-collection'),
            {
                url: '/api/posts',
                type: 'posts'
            }
        );
    });
</script>
```

#### Using ES6 Modules

```html
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script type="module">
    import { KViews } from './src/index.js';
    
    document.addEventListener('DOMContentLoaded', () => {
        const collection = KViews.createCollectionInstance(
            document.getElementById('posts-collection'),
            {
                url: '/api/posts',
                type: 'posts'
            }
        );
    });
</script>
```

### 3. Start a Local Server

**Note:** ES6 modules require HTTP (not `file://`). Bundle version works without a server.

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

## Your First Collection

### Using Bundle

```html
<!DOCTYPE html>
<html>
<head>
    <title>KViews Example</title>
    <style>
        .post {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Posts</h1>
    <div id="posts">
        <div class="post">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <small>ID: {{id}}</small>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script src="./dist/kviews.js"></script>
    <script>
        KViews.createCollectionInstance(document.getElementById('posts'), {
            url: '/api/posts',
            type: 'posts'
        });
    </script>
</body>
</html>
```

### Using ES6 Modules

```html
<!DOCTYPE html>
<html>
<head>
    <title>KViews Example</title>
    <style>
        .post {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Posts</h1>
    <div id="posts">
        <div class="post">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <small>ID: {{id}}</small>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script type="module">
        import { KViews } from './src/index.js';
        
        KViews.createCollectionInstance(document.getElementById('posts'), {
            url: '/api/posts',
            type: 'posts'
        });
    </script>
</body>
</html>
```

## Your First Item

### Using Bundle

```html
<div id="post-detail">
    <h1>{{title}}</h1>
    <p>{{content}}</p>
    <p>Author: {{author.attributes.name}}</p>
</div>

<script src="./dist/kviews.js"></script>
<script>
    KViews.createItemInstance(document.getElementById('post-detail'), {
        url: '/api/posts/1',
        type: 'posts'
    });
</script>
```

### Using ES6 Modules

```html
<div id="post-detail">
    <h1>{{title}}</h1>
    <p>{{content}}</p>
    <p>Author: {{author.attributes.name}}</p>
</div>

<script type="module">
    import { KViews } from './src/index.js';
    
    KViews.createItemInstance(document.getElementById('post-detail'), {
        url: '/api/posts/1',
        type: 'posts'
    });
</script>
```

## Using jQuery Plugin

If jQuery is loaded (works with both bundle and modules), you can use the plugin syntax:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="./dist/kviews.js"></script>
<!-- or -->
<script type="module">
    import './src/index.js'; // Registers jQuery plugin
</script>

<script>
    // Collection
    $('#posts').kviews({
        url: '/api/posts',
        type: 'posts'
    });

    // Item
    $('#post-detail').kviews({
        url: '/api/posts/1',
        resourcetype: 'item'
    });

    // Helper methods
    $('#posts').kviewsCollection('/api/posts');
    $('#post-detail').kviewsItem('/api/posts/1');
</script>
```

## Next Steps

- Read the [Basic Usage Guide](./basic-usage.md)
- Learn about [Collections](./collections.md)
- Explore [Templates](./templates.md)
- Check the [API Reference](../api/KViews.md)
