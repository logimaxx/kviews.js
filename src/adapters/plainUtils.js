/**
 * Read a nested value using dot notation (e.g. "meta.totalRecords").
 *
 * @param {object} obj
 * @param {string|null|undefined} path
 * @returns {*}
 */
export function getPath(obj, path) {
    if (!obj || !path || typeof path !== 'string') {
        return undefined;
    }

    return path.split('.').reduce((current, key) => {
        if (current == null || typeof current !== 'object') {
            return undefined;
        }
        return current[key];
    }, obj);
}

/**
 * Resolve the array of rows from a plain REST collection response.
 *
 * @param {object|Array} doc
 * @param {string|null} itemsPath
 * @returns {Array<object>}
 */
export function extractCollectionRows(doc, itemsPath) {
    if (Array.isArray(doc)) {
        return doc;
    }

    if (!doc || typeof doc !== 'object') {
        return [];
    }

    if (itemsPath) {
        const rows = getPath(doc, itemsPath);
        return Array.isArray(rows) ? rows : [];
    }

    if (Array.isArray(doc.data)) {
        return doc.data;
    }

    if (Array.isArray(doc.items)) {
        return doc.items;
    }

    if (Array.isArray(doc.results)) {
        return doc.results;
    }

    return [];
}

/**
 * Detect total record count from common plain REST response shapes.
 *
 * @param {object} doc
 * @param {string|null} totalPath
 * @returns {number|undefined}
 */
export function extractTotalRecords(doc, totalPath) {
    if (!doc || typeof doc !== 'object') {
        return undefined;
    }

    if (totalPath) {
        const value = getPath(doc, totalPath);
        return value != null ? value * 1 : undefined;
    }

    for (const path of ['total', 'count', 'totalCount', 'meta.totalRecords']) {
        const value = getPath(doc, path);
        if (value != null) {
            return value * 1;
        }
    }

    return undefined;
}

/**
 * Detect list offset from common plain REST response shapes.
 *
 * @param {object} doc
 * @param {string|null} offsetPath
 * @returns {number|undefined}
 */
export function extractOffset(doc, offsetPath) {
    if (!doc || typeof doc !== 'object') {
        return undefined;
    }

    if (offsetPath) {
        const value = getPath(doc, offsetPath);
        return value != null ? value : undefined;
    }

    for (const path of ['offset', 'meta.offset']) {
        const value = getPath(doc, path);
        if (value != null) {
            return value;
        }
    }

    return undefined;
}
