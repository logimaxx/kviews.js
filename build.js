#!/usr/bin/env node

/**
 * Build script for creating KViews bundle
 * Creates both dist/kviews.js (normal) and dist/kviews.min.js (minified)
 */

import { build } from 'esbuild';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, 'dist');
if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
}

const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
const buildTime = new Date().toISOString();

const banner = `/*!
 * KViews - Class-based API data binding library
 * Version: ${packageJson.version}
 * Built: ${buildTime}
 */`;

const baseConfig = {
    entryPoints: [join(__dirname, 'src/index.js')],
    bundle: true,
    format: 'iife',
    globalName: 'KViews',
    external: ['handlebars'], // Handlebars should be loaded separately
    banner: {
        js: banner
    }
};

// Build both versions in parallel
Promise.all([
    // Normal version with sourcemap
    build({
        ...baseConfig,
        outfile: join(distDir, 'kviews.js'),
        minify: false,
        sourcemap: true
    }),
    // Minified version without sourcemap
    build({
        ...baseConfig,
        outfile: join(distDir, 'kviews.min.js'),
        minify: true,
        sourcemap: false
    })
]).then(() => {
    console.log('✅ Bundle created:');
    console.log('   - dist/kviews.js (normal, with sourcemap)');
    console.log('   - dist/kviews.min.js (minified)');
}).catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
