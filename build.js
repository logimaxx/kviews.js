#!/usr/bin/env node

/**
 * Build script for creating KViews bundle
 * Creates both dist/kviews.js (normal) and dist/kviews.min.js (minified)
 */

import { build, transformSync } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
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

const outJs = join(distDir, 'kviews.js');
const outMin = join(distDir, 'kviews.min.js');
const outMap = join(distDir, 'kviews.js.map');
const websiteDistDir = join(__dirname, 'website', 'dist');

/**
 * esbuild IIFE + many exports sets global `KViews` to the CommonJS-style exports object,
 * not the default-exported class — so `KViews.createItemInstance` is missing.
 * The default export (`index_default`) is the KViews class; return that from the IIFE.
 */
function patchIifeReturnToDefaultExport(bundle) {
    const needle = 'return __toCommonJS(index_exports);';
    if (!bundle.includes(needle)) {
        console.warn(
            '⚠️  build post-process: expected IIFE return not found; global KViews may be wrong.'
        );
        return bundle;
    }
    return bundle.replace(needle, 'return index_default;');
}

async function main() {
    const outEsm = join(distDir, 'index.js');

    await Promise.all([
        build({
            entryPoints: [join(__dirname, 'src/index.js')],
            bundle: true,
            format: 'esm',
            platform: 'browser',
            outfile: outEsm,
            sourcemap: true
        }),
        build({
            ...baseConfig,
            outfile: outJs,
            minify: false,
            sourcemap: true
        })
    ]);

    let bundle = readFileSync(outJs, 'utf8');
    bundle = patchIifeReturnToDefaultExport(bundle);
    writeFileSync(outJs, bundle);

    const minBody = transformSync(bundle, { minify: true, loader: 'js' }).code;
    writeFileSync(outMin, banner + '\n' + minBody);

    if (!existsSync(websiteDistDir)) {
        mkdirSync(websiteDistDir, { recursive: true });
    }
    copyFileSync(outJs, join(websiteDistDir, 'kviews.js'));
    copyFileSync(outMin, join(websiteDistDir, 'kviews.min.js'));
    if (existsSync(outMap)) {
        copyFileSync(outMap, join(websiteDistDir, 'kviews.js.map'));
    }

    console.log('✅ Bundle created:');
    console.log('   - dist/index.js (ESM for npm / bundlers, with sourcemap)');
    console.log('   - dist/kviews.js (IIFE browser bundle, with sourcemap)');
    console.log('   - dist/kviews.min.js (IIFE minified, from patched bundle)');
    console.log('   - website/dist/* (IIFE copies for pages that load ./dist/…)');
}

main().catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
