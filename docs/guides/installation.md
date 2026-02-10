# Installation Guide

Learn how to install and set up KViews in your project.

## Installation Methods

### Method 1: Bundle (Recommended for Simple Projects)

The bundle version doesn't require a module system and works in any browser.

#### Download Bundle

Download `dist/kviews.js` and include it in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script src="./dist/kviews.js"></script>
</head>
<body>
    <div id="collection">
        <div class="item">
            <h2>{{attributes.title}}</h2>
        </div>
    </div>

    <script>
        // KViews is available globally
        KViews.createCollectionInstance(document.getElementById('collection'), {
            url: '/api/posts',
            type: 'posts'
        });
    </script>
</body>
</html>
```

**Advantages:**
- ✅ No module system required
- ✅ Works without a local server
- ✅ Simple to use
- ✅ Works in older browsers (with polyfills)

**Disadvantages:**
- ❌ Larger file size (includes all code)
- ❌ No tree-shaking

### Method 2: ES6 Modules (Recommended for Modern Projects)

Use ES6 modules for better code organization and tree-shaking.

#### Copy Source Files

Copy the `src/` directory to your project:

```bash
cp -r src/ /path/to/your/project/
```

#### Import in Your Code

```html
<script type="module">
    import { KViews } from './src/index.js';
    
    KViews.createCollectionInstance(document.getElementById('collection'), {
        url: '/api/posts',
        type: 'posts'
    });
</script>
```

**Advantages:**
- ✅ Better code organization
- ✅ Tree-shaking support
- ✅ Smaller bundle size (if using bundler)
- ✅ Modern JavaScript features

**Disadvantages:**
- ❌ Requires HTTP server (not `file://`)
- ❌ Requires modern browser with ES6 module support

### Method 3: Build Your Own Bundle

Create a custom bundle using a bundler:

#### Using Rollup

```bash
npm install --save-dev rollup @rollup/plugin-node-resolve

# rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/kviews.js',
        format: 'umd',
        name: 'KViews'
    },
    plugins: [nodeResolve()]
};

# Build
npx rollup -c
```

#### Using Webpack

```bash
npm install --save-dev webpack webpack-cli

# webpack.config.js
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'kviews.js',
        library: 'KViews',
        libraryTarget: 'umd'
    },
    externals: {
        'jquery': 'jQuery'
    }
};

# Build
npx webpack
```

#### Using Build Script

The project includes a build script:

```bash
# Install dependencies
npm install

# Build bundle
npm run build

# Build minified bundle
npm run build:min
```

This creates `dist/kviews.js` ready to use.

#### Using esbuild Directly

```bash
npm install --save-dev esbuild

# Build
npx esbuild src/index.js --bundle --format=iife --global-name=KViews --outfile=dist/kviews.js --external:handlebars
```

## Requirements

### Required

- **Handlebars** - Template compilation
  ```html
  <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
  ```

### Optional

- **jQuery** - Falls back to native DOM APIs if not available
  ```html
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  ```

## Browser Support

### Bundle Version
- Works in all modern browsers
- IE11+ with polyfills

### ES6 Modules Version
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+

## CDN Usage (Future)

If published to npm and CDN:

```html
<!-- Bundle version -->
<script src="https://unpkg.com/kviews@latest/dist/kviews.js"></script>

<!-- Or ES6 modules -->
<script type="module">
    import { KViews } from 'https://unpkg.com/kviews@latest/src/index.js';
</script>
```

## Verifying Installation

Check if KViews is loaded:

```javascript
// Bundle version
if (typeof KViews !== 'undefined') {
    console.log('KViews loaded:', KViews);
} else {
    console.error('KViews not found');
}

// ES6 modules version
import { KViews } from './src/index.js';
console.log('KViews loaded:', KViews);
```

## Troubleshooting

### "KViews is not defined"
- Ensure bundle is loaded before using KViews
- Check script path is correct
- Verify no JavaScript errors before KViews script

### "Failed to load module"
- Ensure you're using HTTP server (not `file://`)
- Check import paths are correct
- Verify browser supports ES6 modules

### "Handlebars is not defined"
- Load Handlebars before KViews
- Check Handlebars CDN is accessible
