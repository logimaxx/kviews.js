# Using the Bundle

Learn how to use KViews without ES6 modules using the bundled version.

## What is the Bundle?

The bundle (`dist/kviews.js`) is a single JavaScript file that includes all KViews functionality. It doesn't require a module system and works in any browser.

## Advantages

- ✅ **No module system required** - Works with plain `<script>` tags
- ✅ **No HTTP server needed** - Can be opened directly from file system
- ✅ **Simple integration** - Just include one file
- ✅ **Works everywhere** - Compatible with older build systems

## Building the Bundle

### Using npm Script

```bash
npm install
npm run build
```

This creates `dist/kviews.js`.

### Manual Build

If you have esbuild installed:

```bash
npx esbuild src/index.js --bundle --format=iife --global-name=KViews --outfile=dist/kviews.js --external:handlebars
```

## Including the Bundle

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>KViews Example</title>
</head>
<body>
    <div id="collection">
        <div class="item">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
        </div>
    </div>

    <!-- Load jQuery first -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- Load Handlebars -->
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    
    <!-- Load KViews bundle -->
    <script src="./dist/kviews.js"></script>
    
    <!-- Use KViews -->
    <script>
        $(document).ready(function() {
            KViews.createCollectionInstance($('#collection'), {
                url: '/api/posts',
                type: 'posts'
            });
        });
    </script>
</body>
</html>
```

## Global Access

When the bundle is loaded, `KViews` is available globally:

```javascript
// Available as window.KViews
log(KViews);

// Create collection
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});

// Create item
const item = KViews.createItemInstance('#post', {
    url: '/api/posts/1',
    type: 'posts'
});
```

## jQuery Plugin

If jQuery is loaded, the bundle automatically registers jQuery plugins:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="./dist/kviews.js"></script>
<script>
    // jQuery plugin is automatically available
    $('#posts').kviews({
        url: '/api/posts',
        type: 'posts'
    });
    
    // Helper methods
    $('#posts').kviewsCollection('/api/posts');
    $('#item').kviewsItem('/api/posts/1');
</script>
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>KViews Bundle Example</title>
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
    
    <form id="create-form">
        <input type="text" name="title" placeholder="Title">
        <textarea name="content" placeholder="Content"></textarea>
        <button type="submit">Create</button>
    </form>
    
    <div id="posts">
        <div class="post">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <button onclick="this.closest('.post').querySelector('[data-instance]').delete()">Delete</button>
        </div>
    </div>

    <!-- Dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- KViews Bundle -->
    <script src="./dist/kviews.js"></script>
    
    <!-- Application Code -->
    <script>
        // Create collection
        const collection = KViews.createCollectionInstance('#posts', {
            url: '/api/posts',
            type: 'posts'
        });
        
        // Handle form submission
        document.getElementById('create-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            collection.append({
                attributes: {
                    title: formData.get('title'),
                    content: formData.get('content')
                }
            });
            this.reset();
        });
        
        // Listen to events
        collection.on('load', (collection) => {
            log('Loaded', collection.items.length, 'items');
        });
    </script>
</body>
</html>
```

## Accessing Exported Classes

The bundle exposes `KViews` globally. Other classes are available through KViews:

```javascript
// Item and Collection are available through instances
const collection = KViews.createCollectionInstance('#posts', {
    url: '/api/posts',
    type: 'posts'
});

// Access Item class through collection items
collection.items.forEach(item => {
    log(item instanceof Item); // Item is internal
});

// Utilities are available via KViews.helpers (recommended)
KViews.helpers.fillForm('#form', item);
```

## Debugging

Enable debug logging:

```javascript
window.kviewsLogLevel = 3; // Maximum logging
```

## File Size

The bundle includes all KViews code:
- Unminified: ~XX KB
- Minified: ~XX KB (use `npm run build:min`)

## Browser Compatibility

The bundle works in:
- All modern browsers
- IE11+ (with polyfills for Promise, Object.assign, etc.)

## When to Use Bundle vs Modules

### Use Bundle When:
- ✅ Simple projects without build tools
- ✅ Quick prototypes
- ✅ Legacy projects
- ✅ No need for tree-shaking
- ✅ Want to avoid module system complexity

### Use ES6 Modules When:
- ✅ Modern projects with build tools
- ✅ Need tree-shaking
- ✅ Want better code organization
- ✅ Using bundlers (Webpack, Rollup, Vite)
- ✅ TypeScript projects

## Troubleshooting

### "KViews is not defined"
- Ensure bundle is loaded before using KViews
- Check script path is correct
- Verify no JavaScript errors before KViews script

### "Handlebars is not defined"
- Load Handlebars before KViews bundle
- Check Handlebars CDN is accessible

### Script Loading Order
Always load in this order:
1. Handlebars
2. jQuery (required)
3. KViews bundle
4. Your application code
