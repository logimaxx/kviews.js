/**
 * Utility functions for KViews
 */

/**
 * Debug logging function
 */
export function dbg() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel==3) {
        console.trace(...arguments);
    }
}
export function log() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel==2) {
        console.log(...arguments);
    }
}
export function error() {
    if (typeof kviewsLogLevel !== "undefined" && kviewsLogLevel==1) {
        console.error(...arguments);
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
    if (!el || (typeof $ !== "undefined" && $(el).length === 0)) {
        return db;
    }

    // Use jQuery if available, otherwise use native DOM API
    let boundData;
    if (typeof $ !== "undefined") {
        boundData = $(el).data();
    } else {
        boundData = {};
        // Fallback: read data-* attributes manually
        if (el.dataset) {
            Object.keys(el.dataset).forEach(key => {
                try {
                    db[key] = JSON.parse(el.dataset[key]);
                } catch (e) {
                    db[key] = el.dataset[key];
                }
            });
        }
        return db;
    }

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

/**
 * Create overlay element for loading indicators
 */
export function createOverlay() {
    if (typeof $ !== "undefined") {
        return $("<div>").text("Se incarca").addClass("komponent-overlay")
            .attr("style", "background: silver; text-align: center;position:absolute; z-index:100000");
    }
    // Fallback without jQuery
    const overlay = document.createElement("div");
    overlay.textContent = "Se incarca";
    overlay.className = "komponent-overlay";
    overlay.style.cssText = "background: silver; text-align: center;position:absolute; z-index:100000";
    return overlay;
}
