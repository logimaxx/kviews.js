/**
 * Utility functions for KViews
 */

/**
 * Debug logging function
 */
export function dbg() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel>=3) {
        console.trace(...arguments);
    }
}
export function log() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel>=2) {
        console.log(...arguments);
    }
}
export function error() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel>=1) {
        console.error(...arguments);
    }
}

export function trace() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel>=4) {
        console.trace(...arguments);
    }
}


/**
 * Generate unique ID
 */
export function uid() {
    return "uid_" + Math.random().toString(36).substr(2, 9);
}

/**
 * Parse options object
 */
export function parseOptions(options) {
    if (typeof options === "undefined") {
        return {};
    }

    if (options.constructor === Object) {
        return options;
    }

    throw new Error("Invalid options", options);
}

/**
 * Deep equality check for plain data (objects, arrays, primitives).
 */
export function deepEqual(a, b) {
    if (a === b) {
        return true;
    }

    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
        return false;
    }

    for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Deep merge utility
 */
export function deepmerge(target, source, optionsArgument) {
    function defaultArrayMerge(target, source, optionsArgument) {
        let destination = target.slice();
        source.forEach(function (e, i) {
            if (typeof destination[i] === 'undefined') {
                destination[i] = cloneIfNecessary(e, optionsArgument);
            } else if (isMergeableObject(e)) {
                destination[i] = deepmerge(target[i], e, optionsArgument);
            } else if (target.indexOf(e) === -1) {
                destination.push(cloneIfNecessary(e, optionsArgument));
            }
        });
        return destination;
    }

    function isMergeableObject(val) {
        var nonNullObject = val && typeof val === 'object';
        return nonNullObject
            && Object.prototype.toString.call(val) !== '[object RegExp]'
            && Object.prototype.toString.call(val) !== '[object Date]';
    }

    function emptyTarget(val) {
        return Array.isArray(val) ? [] : {};
    }

    function cloneIfNecessary(value, optionsArgument) {
        let clone = optionsArgument && optionsArgument.clone === true;
        return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value;
    }

    function mergeObject(target, source, optionsArgument) {
        let destination = {};

        if (isMergeableObject(target)) {
            Object.keys(target).forEach(function (key) {
                destination[key] = cloneIfNecessary(target[key], optionsArgument);
            });
        }

        Object.keys(source).forEach(function (key) {
            if (!isMergeableObject(source[key]) || !target[key]) {
                destination[key] = cloneIfNecessary(source[key], optionsArgument);
            } else {
                destination[key] = deepmerge(target[key], source[key], optionsArgument);
            }
        });
        return destination;
    }

    let array = Array.isArray(source);
    let options = optionsArgument || { arrayMerge: defaultArrayMerge };
    let arrayMerge = options.arrayMerge || defaultArrayMerge;

    if (array) {
        return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument);
    } else {
        return mergeObject(target, source, optionsArgument);
    }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
        throw new Error('first argument should be an array with at least two elements');
    }

    return array.reduce(function (prev, next) {
        return deepmerge(prev, next, optionsArgument);
    });
};

/**
 * Get bound objects from element data attributes
 */
export function getBoundObjects(el) {
    let db = {};
    if (!el || $(el).length === 0) {
        return db;
    }

    let boundData = $(el).data();
    for (let key in boundData) {
        if (typeof boundData[key] === "object" && key !== "instance") {
            db[key] = boundData[key];
        }
    }
    return db;
}

/**
 * Template compilation (uses Handlebars if available)
 */
export function template(text) {
    if (typeof Handlebars !== "undefined") {
        return Handlebars.compile(text);
    }
    throw new Error("Handlebars is required for template compilation");
}

const OVERLAY_STYLE_ID = "kviews-overlay-styles";
const OVERLAY_CSS = `
.komponent-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
  pointer-events: auto;
}
@media (prefers-color-scheme: dark) {
  .komponent-overlay {
    background: rgba(15, 20, 25, 0.55);
  }
}
.komponent-overlay-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(0, 0, 0, 0.12);
  border-top-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  animation: kviews-overlay-spin 0.6s linear infinite;
}
@media (prefers-color-scheme: dark) {
  .komponent-overlay-spinner {
    border-color: rgba(255, 255, 255, 0.15);
    border-top-color: rgba(255, 255, 255, 0.7);
  }
}
@keyframes kviews-overlay-spin {
  to { transform: rotate(360deg); }
}
`;

function ensureOverlayStyles() {
    if (typeof document === "undefined") {
        return;
    }
    if (document.getElementById(OVERLAY_STYLE_ID)) {
        return;
    }
    const style = document.createElement("style");
    style.id = OVERLAY_STYLE_ID;
    style.textContent = OVERLAY_CSS;
    document.head.appendChild(style);
}

function resolveOverlayHost(host) {
    if (!host) {
        return null;
    }
    if (host.nodeName) {
        return host;
    }
    return $(host)[0] || null;
}

/**
 * Create overlay element for loading indicators
 */
export function createOverlay(/* instance */) {
    ensureOverlayStyles();
    const el = document.createElement("div");
    el.className = "komponent-overlay";
    el.setAttribute("aria-busy", "true");
    const spinner = document.createElement("span");
    spinner.className = "komponent-overlay-spinner";
    spinner.setAttribute("aria-hidden", "true");
    el.appendChild(spinner);
    return $(el);
}

/**
 * Mount a loading overlay inside the host so stacking stays local to that view.
 */
export function placeOverlay(host, instance) {
    const hostEl = resolveOverlayHost(host);
    if (!hostEl) {
        return $();
    }
    const $overlay = createOverlay(instance);
    const overlayEl = $overlay[0];
    overlayEl._kviewsOverlayHost = hostEl;
    if (!hostEl._kviewsOverlayCount) {
        hostEl._kviewsOverlayRestore = {
            position: hostEl.style.position,
            isolation: hostEl.style.isolation,
        };
        const computed = window.getComputedStyle(hostEl);
        if (!computed.position || computed.position === "static") {
            hostEl.style.position = "relative";
        }
        if (computed.isolation !== "isolate") {
            hostEl.style.isolation = "isolate";
        }
    }
    hostEl._kviewsOverlayCount = (hostEl._kviewsOverlayCount || 0) + 1;
    hostEl.appendChild(overlayEl);
    return $overlay;
}

/**
 * Remove a mounted overlay and restore host stacking styles when none remain.
 */
export function removeOverlay($overlay) {
    const overlayEl = $overlay && ($overlay[0] || ($overlay.nodeName ? $overlay : null));
    if (!overlayEl) {
        return;
    }
    const hostEl = overlayEl._kviewsOverlayHost;
    if (overlayEl.parentNode) {
        overlayEl.parentNode.removeChild(overlayEl);
    }
    if (!hostEl) {
        return;
    }
    hostEl._kviewsOverlayCount = Math.max(0, (hostEl._kviewsOverlayCount || 1) - 1);
    if (hostEl._kviewsOverlayCount > 0) {
        return;
    }
    const restore = hostEl._kviewsOverlayRestore;
    if (restore) {
        hostEl.style.position = restore.position;
        hostEl.style.isolation = restore.isolation;
    }
    delete hostEl._kviewsOverlayCount;
    delete hostEl._kviewsOverlayRestore;
}
