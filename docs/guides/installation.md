# Installation Guide

Learn how to install and set up KViews in your project.

**Runtime:** KViews requires **jQuery** and **Handlebars** in the browser (npm `peerDependencies`). Load **jQuery first**, then **Handlebars**, then `dist/kviews.js` or your module entry.

## Installation Methods

### Method 1: Bundle (Recommended for Simple Projects)

The bundle version does not require a module system and targets modern browsers (same baseline as this project’s build).

#### Download Bundle

Download `dist/kviews.js` and include it in your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
    <script src="./dist/kviews.js"></script>
</head>
<body>
    <div id="collection">
        <div class="item">
            <h2>{{title}}</h2>
        </div>
    </div>

    <script>
        // KViews is available globally
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

**Advantages:**
- No module system required
- Simple to drop into static HTML

**Disadvantages:**

- Larger download than a tree‑shaken app bundle when you ship the full library globally

### Method 2: ES modules from npm

The published **`@logimaxx/kviews`** package exposes **`dist/index.js`** as its ES module entry. Install peers and resolve `@logimaxx/kviews` through your bundler (Vite, webpack, Rollup, and similar).

```bash
npm install @logimaxx/kviews handlebars jquery
```

```javascript
import KViews from '@logimaxx/kviews';
// named exports: Collection, Item, Storage, ...
```

Typical HTML (peers global; app code bundled or as a separate module):

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script type="module" src="./main.js"></script>
```

Inside `main.js`, `import KViews from '@logimaxx/kviews'` is resolved by your bundler.

**Fork or vendor `src/` (advanced):** only when you develop KViews itself—clone the repo and import from `./src/index.js`. The npm tarball does **not** ship `src/`.

**Advantages:**

- Tree-shaking and modern tooling
- Same API as the IIFE bundle

**Disadvantages:**

- Needs a build step for most apps
- ES `import` in the browser alone does not resolve the package name—you need a bundler or import maps

### Method 3: Build your own bundle

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

#### This repository's build script

When working from a clone of this repository:

```bash
npm install
npm run build
```

This refreshes `dist/index.js` (npm ESM entry), `dist/kviews.js`, `dist/kviews.min.js`, and sourcemaps. Publishing runs `prepack`, which invokes the same build.

#### Using esbuild directly

```bash
npm install --save-dev esbuild

# Build
npx esbuild src/index.js --bundle --format=iife --global-name=KViews --outfile=dist/kviews.js --external:handlebars
```

## Requirements

- **jQuery** — load first; required for DOM manipulation
  ```html
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  ```

- **Handlebars** — load second; template compilation
  ```html
  <script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
  ```

## Browser support

- **Bundled workflow** (`dist/kviews.js`): targets modern JavaScript (same as `build.js`; no guarantees for legacy IE without forking).
- **ES modules** (`dist/index.js`, via `"@logimaxx/kviews"` in a bundler): evergreen browsers aligned with baseline ES modules (for example Chrome 61+, Firefox 60+, Safari 11+, Edge 16+).

## CDN usage (bundle)

With jQuery and Handlebars loaded first, you can point a `<script>` tag at npm CDNs—for example jsDelivr or unpkg—for the **IIFE bundle only** (`dist/kviews.js`):

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@logimaxx/kviews@latest/dist/kviews.js"></script>
```

For **bare `import '@logimaxx/kviews'`** in browser modules, configure your bundler or use [import maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap); unpinned CDN `import` of `dist/index.js` is possible but you must pin a version URL and handle peer globals yourself.

## Verifying Installation

Check if KViews is loaded:

```javascript
// Bundle version
if (typeof KViews !== 'undefined') {
    log('KViews loaded:', KViews);
} else {
    console.error('KViews not found');
}

// ES modules version (consumers typically use package name resolved by bundler)
import KViews from '@logimaxx/kviews';
log('KViews loaded:', KViews);
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

### "`$` is not defined" / jQuery errors
- Load **jQuery** before Handlebars and before KViews (or ensure your bundler provides global `$`)
- KViews uses jQuery for DOM operations; it is not optional at runtime
